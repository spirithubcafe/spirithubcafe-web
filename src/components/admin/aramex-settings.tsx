import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { aramexService } from '@/services/aramex';
import { useTranslation } from 'react-i18next';
import type { AramexSettings } from '@/types/aramex';

const defaultSettings: AramexSettings = {
  enabled: false,
  environment: 'test',
  accountNumber: '',
  accountPin: '',
  accountEntity: '',
  accountCountryCode: 'OM',
  username: '',
  password: '',
  autoCreateShipment: false,
  testMode: true,
  enableLogging: false,
  senderInfo: {
    companyName: '',
    contactPerson: '',
    addressLine: '',
    city: '',
    countryCode: 'OM',
    phoneNumber: '',
    emailAddress: '',
  },
  pickupInfo: {
    readyTime: '16:00',
    lastPickupTime: '18:00',
    closingTime: '18:00',
  },
};

export const AramexSettingsComponent: React.FC = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AramexSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'aramex'));
      if (settingsDoc.exists()) {
        setSettings({ ...defaultSettings, ...settingsDoc.data() } as AramexSettings);
      }
    } catch (error) {
      console.error('Error loading Aramex settings:', error);
      toast.error(t('aramex.errors.loadingSettings') || 'Error loading Aramex settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'aramex'), settings);
      toast.success(t('aramex.messages.settingsSaved') || 'Aramex settings saved successfully');
    } catch (error) {
      console.error('Error saving Aramex settings:', error);
      toast.error(t('aramex.errors.savingSettings') || 'Error saving Aramex settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!settings.enabled) {
      toast.error(t('aramex.errors.enableFirst') || 'Please enable Aramex service first');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Save current settings temporarily for testing
      await setDoc(doc(db, 'settings', 'aramex'), settings);

      // Test with a sample rate calculation
      const testRequest = {
        originCity: settings.senderInfo?.city || 'Muscat',
        originCountry: settings.senderInfo?.countryCode || 'OM',
        destCity: 'Dubai',
        destCountry: 'AE',
        weight: 1,
      };

      const result = await aramexService.calculateShippingRate(testRequest);

      if (result.success) {
        setTestResult({
          success: true,
          message: t('aramex.messages.connectionSuccess', { rate: result.rate, currency: result.currency }) 
            || `Connection successful! Sample rate: ${result.rate} ${result.currency}`,
        });
        toast.success(t('aramex.messages.connectionSuccessful') || 'Aramex connection successful');
      } else {
        setTestResult({
          success: false,
          message: result.error || t('aramex.errors.connectionError') || 'Error connecting to Aramex',
        });
        toast.error(t('aramex.errors.connectionError') || 'Error connecting to Aramex');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : t('aramex.errors.unexpectedError') || 'Unexpected error',
      });
      toast.error(t('aramex.errors.testingConnection') || 'Error testing connection');
    } finally {
      setTesting(false);
    }
  };

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{t('aramex.settings.title') || 'Aramex Service Settings'}</span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSettings('enabled', checked)}
            />
          </CardTitle>
          <CardDescription>
            {t('aramex.settings.description') || 'Configure Aramex shipping service for order fulfillment'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="environment">{t('aramex.fields.environment') || 'Environment'}</Label>
                <Select
                  value={settings.environment}
                  onValueChange={(value: 'test' | 'production') => updateSettings('environment', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('aramex.fields.selectEnvironment') || 'Select environment'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">{t('aramex.options.test') || 'Test'}</SelectItem>
                    <SelectItem value="production">{t('aramex.options.production') || 'Production'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="countryCode">{t('aramex.fields.countryCode') || 'Country Code'}</Label>
                <Input
                  id="countryCode"
                  value={settings.accountCountryCode}
                  onChange={(e) => updateSettings('accountCountryCode', e.target.value)}
                  placeholder="OM"
                  maxLength={2}
                />
              </div>
            </div>

            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">{t('aramex.tabs.account') || 'Account Info'}</TabsTrigger>
                <TabsTrigger value="sender">{t('aramex.tabs.sender') || 'Sender Info'}</TabsTrigger>
                <TabsTrigger value="pickup">{t('aramex.tabs.pickup') || 'Pickup Settings'}</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountNumber">{t('aramex.fields.accountNumber') || 'Account Number'}</Label>
                    <Input
                      id="accountNumber"
                      type="text"
                      value={settings.accountNumber}
                      onChange={(e) => updateSettings('accountNumber', e.target.value)}
                      placeholder={t('aramex.placeholders.accountNumber') || 'Aramex account number'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountPin">{t('aramex.fields.accountPin') || 'Account PIN'}</Label>
                    <Input
                      id="accountPin"
                      type="password"
                      value={settings.accountPin}
                      onChange={(e) => updateSettings('accountPin', e.target.value)}
                      placeholder={t('aramex.placeholders.accountPin') || 'Aramex account PIN'}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">{t('aramex.fields.username') || 'Username'}</Label>
                    <Input
                      id="username"
                      type="text"
                      value={settings.username}
                      onChange={(e) => updateSettings('username', e.target.value)}
                      placeholder={t('aramex.placeholders.username') || 'API username'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">{t('aramex.fields.password') || 'Password'}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={settings.password}
                      onChange={(e) => updateSettings('password', e.target.value)}
                      placeholder={t('aramex.placeholders.password') || 'API password'}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accountEntity">{t('aramex.fields.accountEntity') || 'Account Entity'}</Label>
                  <Input
                    id="accountEntity"
                    type="text"
                    value={settings.accountEntity}
                    onChange={(e) => updateSettings('accountEntity', e.target.value)}
                    placeholder={t('aramex.placeholders.accountEntity') || 'Aramex account entity'}
                  />
                </div>
              </TabsContent>

              <TabsContent value="sender" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">{t('aramex.fields.companyName') || 'Company Name'}</Label>
                    <Input
                      id="companyName"
                      value={settings.senderInfo?.companyName || ''}
                      onChange={(e) => updateSettings('senderInfo.companyName', e.target.value)}
                      placeholder={t('aramex.placeholders.companyName') || 'Sender company name'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">{t('aramex.fields.contactPerson') || 'Contact Person'}</Label>
                    <Input
                      id="contactPerson"
                      value={settings.senderInfo?.contactPerson || ''}
                      onChange={(e) => updateSettings('senderInfo.contactPerson', e.target.value)}
                      placeholder={t('aramex.placeholders.contactPerson') || 'Contact person name'}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="addressLine">{t('aramex.fields.address') || 'Address'}</Label>
                  <Input
                    id="addressLine"
                    value={settings.senderInfo?.addressLine || ''}
                    onChange={(e) => updateSettings('senderInfo.addressLine', e.target.value)}
                    placeholder={t('aramex.placeholders.address') || 'Complete sender address'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">{t('aramex.fields.city') || 'City'}</Label>
                    <Input
                      id="city"
                      value={settings.senderInfo?.city || ''}
                      onChange={(e) => updateSettings('senderInfo.city', e.target.value)}
                      placeholder={t('aramex.placeholders.city') || 'Sender city'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderCountryCode">{t('aramex.fields.countryCode') || 'Country Code'}</Label>
                    <Input
                      id="senderCountryCode"
                      value={settings.senderInfo?.countryCode || ''}
                      onChange={(e) => updateSettings('senderInfo.countryCode', e.target.value)}
                      placeholder="OM"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber">{t('aramex.fields.phoneNumber') || 'Phone Number'}</Label>
                    <Input
                      id="phoneNumber"
                      value={settings.senderInfo?.phoneNumber || ''}
                      onChange={(e) => updateSettings('senderInfo.phoneNumber', e.target.value)}
                      placeholder={t('aramex.placeholders.phoneNumber') || 'Phone number'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailAddress">{t('aramex.fields.email') || 'Email'}</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={settings.senderInfo?.emailAddress || ''}
                      onChange={(e) => updateSettings('senderInfo.emailAddress', e.target.value)}
                      placeholder={t('aramex.placeholders.email') || 'Email address'}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pickup" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="readyTime">{t('aramex.fields.readyTime') || 'Ready Time'}</Label>
                    <Input
                      id="readyTime"
                      type="time"
                      value={settings.pickupInfo?.readyTime || ''}
                      onChange={(e) => updateSettings('pickupInfo.readyTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastPickupTime">{t('aramex.fields.lastPickupTime') || 'Last Pickup Time'}</Label>
                    <Input
                      id="lastPickupTime"
                      type="time"
                      value={settings.pickupInfo?.lastPickupTime || ''}
                      onChange={(e) => updateSettings('pickupInfo.lastPickupTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="closingTime">{t('aramex.fields.closingTime') || 'Closing Time'}</Label>
                    <Input
                      id="closingTime"
                      type="time"
                      value={settings.pickupInfo?.closingTime || ''}
                      onChange={(e) => updateSettings('pickupInfo.closingTime', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {testResult && (
              <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                    {testResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button onClick={saveSettings} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                ذخیره تنظیمات
              </Button>
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={testing || !settings.enabled}
              >
                {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <TestTube className="mr-2 h-4 w-4" />
                تست اتصال
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};