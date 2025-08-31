import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminDebugSettings } from '@/stores/admin-debug-store';
import { Settings, Bug, Activity, RotateCcw, AlertTriangle } from 'lucide-react';

interface AdminDebugControlPanelProps {
  className?: string;
}

export const AdminDebugControlPanel: React.FC<AdminDebugControlPanelProps> = ({ className }) => {
  const {
    showPerformanceBudget,
    showAuthDebugPanel,
    enableDebugMode,
    togglePerformanceBudget,
    toggleAuthDebugPanel,
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
          Control the visibility of debug and performance monitoring tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Debug Mode Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                <span className="font-medium">Enable Debug Mode</span>
                <Badge variant={enableDebugMode ? "default" : "secondary"}>
                  {enableDebugMode ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Master switch for all debug tools. Must be enabled to show any debug panels.
              </p>
            </div>
            <Switch
              checked={enableDebugMode}
              onCheckedChange={toggleDebugMode}
            />
          </div>
        </div>

        {/* Individual Tool Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Individual Tools</h4>
          
          {/* Performance Budget */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Performance Budget</span>
                <Badge variant={showPerformanceBudget ? "default" : "outline"}>
                  {showPerformanceBudget ? "Visible" : "Hidden"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Show performance metrics and budget monitoring panel
              </p>
            </div>
            <Switch
              checked={showPerformanceBudget}
              onCheckedChange={togglePerformanceBudget}
              disabled={!enableDebugMode}
            />
          </div>

          {/* Auth Debug Panel */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                <span className="font-medium">Auth Debug Panel</span>
                <Badge variant={showAuthDebugPanel ? "default" : "outline"}>
                  {showAuthDebugPanel ? "Visible" : "Hidden"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Show Firebase authentication debugging tools
              </p>
            </div>
            <Switch
              checked={showAuthDebugPanel}
              onCheckedChange={toggleAuthDebugPanel}
              disabled={!enableDebugMode}
            />
          </div>
        </div>

        {/* Warning and Reset */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-900 dark:text-orange-100">
                Development Mode Only
              </p>
              <p className="text-orange-700 dark:text-orange-300">
                Debug tools are only visible in development environment or for admin users in production.
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={resetAllSettings}
            className="w-full"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All Settings
          </Button>
        </div>

        {/* Current Status */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground">Current Status</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Environment:</span>
              <Badge variant="outline" className="text-xs">
                {import.meta.env.DEV ? 'Development' : 'Production'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Debug Mode:</span>
              <Badge variant={enableDebugMode ? "default" : "secondary"} className="text-xs">
                {enableDebugMode ? 'ON' : 'OFF'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDebugControlPanel;
