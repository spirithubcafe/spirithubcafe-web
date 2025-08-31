import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminDebugSettings } from '@/stores/admin-debug-store';
import { Settings, Bug, RotateCcw, AlertTriangle } from 'lucide-react';

interface AdminDebugControlPanelProps {
  className?: string;
}

export const AdminDebugControlPanel: React.FC<AdminDebugControlPanelProps> = ({ className }) => {
  const {
    enableDebugMode,
    toggleDebugMode,
    resetAllSettings,
  } = useAdminDebugSettings();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Debug Tools Control Panel
        </CardTitle>
        <CardDescription>
          Control debug features and development tools visibility.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Debug Mode Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              <label htmlFor="debug-mode" className="font-medium">
                Debug Mode
              </label>
              <Badge variant={enableDebugMode ? "default" : "outline"}>
                {enableDebugMode ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Switch
              id="debug-mode"
              checked={enableDebugMode}
              onCheckedChange={toggleDebugMode}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Enable debug mode for development tools and logging.
          </p>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetAllSettings}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All Settings
          </Button>
        </div>

        {/* Development Warning */}
        {enableDebugMode && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Debug mode is enabled. Performance may be affected.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
