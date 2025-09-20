import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Download, 
  Eye, 
  Truck, 
  Package, 
  Calendar,
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAramexShipping } from '@/hooks/useAramexShipping';
import type { AramexShipment } from '@/types/aramex';

interface AramexManagementProps {
  orderId?: string;
}

export const AramexManagementComponent: React.FC<AramexManagementProps> = ({ orderId }) => {
  const { 
    getShipments, 
    schedulePickup, 
    downloadLabel, 
    viewLabel,
    isAvailable 
  } = useAramexShipping();
  
  const [shipments, setShipments] = useState<AramexShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<AramexShipment | null>(null);
  const [schedulingPickup, setSchedulingPickup] = useState<string | null>(null);

  useEffect(() => {
    if (isAvailable()) {
      loadShipments();
    }
  }, [orderId]);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const shipmentData = await getShipments(orderId);
      setShipments(shipmentData);
    } catch (error) {
      console.error('Error loading shipments:', error);
      toast.error('خطا در بارگذاری مرسولات');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePickup = async (shipment: AramexShipment) => {
    if (!shipment.awb) return;
    
    setSchedulingPickup(shipment.awb);
    try {
      const result = await schedulePickup(shipment.awb, shipment.weight);
      if (result.success) {
        toast.success('پیکاپ با موفقیت برنامه‌ریزی شد');
        loadShipments(); // Refresh the list
      } else {
        toast.error(result.error || 'خطا در برنامه‌ریزی پیکاپ');
      }
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      toast.error('خطا در برنامه‌ریزی پیکاپ');
    } finally {
      setSchedulingPickup(null);
    }
  };

  const handleDownloadLabel = async (awb: string) => {
    try {
      await downloadLabel(awb);
    } catch (error) {
      console.error('Error downloading label:', error);
      toast.error('خطا در دانلود برچسب');
    }
  };

  const handleViewLabel = async (awb: string) => {
    try {
      await viewLabel(awb);
    } catch (error) {
      console.error('Error viewing label:', error);
      toast.error('خطا در نمایش برچسب');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'در انتظار' },
      created: { variant: 'default' as const, text: 'ایجاد شده' },
      picked_up: { variant: 'outline' as const, text: 'تحویل داده شده' },
      pickup_scheduled: { variant: 'default' as const, text: 'پیکاپ برنامه‌ریزی شده' },
      in_transit: { variant: 'default' as const, text: 'در حال ارسال' },
      delivered: { variant: 'default' as const, text: 'تحویل داده شده' },
      failed: { variant: 'destructive' as const, text: 'ناموفق' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!isAvailable()) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          سرویس آرامکس فعال نیست یا پیکربندی نشده است.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">بارگذاری مرسولات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                مدیریت مرسولات آرامکس
              </CardTitle>
              <CardDescription>
                {orderId ? `مرسولات سفارش ${orderId}` : 'تمام مرسولات آرامکس'}
              </CardDescription>
            </div>
            <Button onClick={loadShipments} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              به‌روزرسانی
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {shipments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هیچ مرسوله‌ای یافت نشد</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شماره AWB</TableHead>
                  <TableHead>سفارش</TableHead>
                  <TableHead>مشتری</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>وزن</TableHead>
                  <TableHead>تاریخ ایجاد</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono">
                      {shipment.awb || 'N/A'}
                    </TableCell>
                    <TableCell>{shipment.orderId}</TableCell>
                    <TableCell>{shipment.customerName}</TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    <TableCell>{shipment.weight.toFixed(2)} کیلوگرم</TableCell>
                    <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {shipment.awb && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewLabel(shipment.awb!)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadLabel(shipment.awb!)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {(shipment.status === 'created' || shipment.status === 'pending') && (
                              <Button
                                size="sm"
                                variant="default"
                                disabled={schedulingPickup === shipment.awb}
                                onClick={() => handleSchedulePickup(shipment)}
                              >
                                {schedulingPickup === shipment.awb ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Calendar className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedShipment(shipment)}
                            >
                              جزئیات
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>جزئیات مرسوله</DialogTitle>
                              <DialogDescription>
                                اطلاعات کامل مرسوله آرامکس
                              </DialogDescription>
                            </DialogHeader>
                            {selectedShipment && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">شماره AWB:</Label>
                                    <p className="font-mono">{selectedShipment.awb || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">وضعیت:</Label>
                                    <div className="mt-1">
                                      {getStatusBadge(selectedShipment.status)}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">آدرس مشتری:</Label>
                                  <p className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                                    {selectedShipment.customerAddress}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">وزن:</Label>
                                    <p>{selectedShipment.weight.toFixed(2)} کیلوگرم</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">تاریخ ایجاد:</Label>
                                    <p>{formatDate(selectedShipment.createdAt)}</p>
                                  </div>
                                </div>
                                {selectedShipment.pickupReference && (
                                  <div>
                                    <Label className="text-sm font-medium">کد پیکاپ:</Label>
                                    <p className="font-mono">{selectedShipment.pickupReference}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <label className={className}>{children}</label>
);