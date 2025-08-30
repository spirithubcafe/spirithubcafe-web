import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Database } from 'lucide-react'
import { initializeAramexSettings } from '@/utils/aramexInitializer'

const InitializeAramexPage: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleInitialize = async () => {
    setIsInitializing(true)
    setResult(null)

    try {
      const success = await initializeAramexSettings()
      
      if (success) {
        setResult({
          success: true,
          message: 'تم إدراج تنظيمات أرامكس الافتراضية بنجاح في قاعدة البيانات'
        })
      } else {
        setResult({
          success: false,
          message: 'فشل في إدراج تنظيمات أرامكس'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Database className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            تهيئة تنظيمات أرامكس
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدراج التنظيمات الافتراضية لـ أرامكس في قاعدة البيانات
          </p>
        </div>

        {result && (
          <Alert className={`mb-6 ${result.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}`}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <AlertDescription className={result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              التنظيمات التي سيتم إدراجها:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• بيانات اعتماد أرامكس</li>
              <li>• معلومات الشاحن (Spirit Hub)</li>
              <li>• خدمات الشحن (محلية ودولية)</li>
              <li>• الإعدادات العامة</li>
            </ul>
          </div>

          <Button 
            onClick={handleInitialize}
            disabled={isInitializing}
            className="w-full"
            size="lg"
          >
            {isInitializing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                جارِ التهيئة...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                تهيئة تنظيمات أرامكس
              </>
            )}
          </Button>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="text-sm"
            >
              العودة إلى لوحة التحكم
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InitializeAramexPage
