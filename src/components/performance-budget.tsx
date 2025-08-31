import { useState, memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, Clock, Zap, TrendingUp, X } from 'lucide-react'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'
import { shouldShowDebugTool } from '@/stores/admin-debug-store'
import { useAuth } from '@/hooks/useAuth'

interface PerformanceBudget {
  metric: string
  budget: number
  current: number
  unit: string
  description: string
  icon: any
}

const PerformanceBudgetComponent = memo(() => {
  const { currentUser } = useAuth()
  const [budgets, setBudgets] = useState<PerformanceBudget[]>([])
  const [overallScore, setOverallScore] = useState(0)

  // Check if component should be visible based on admin settings
  const shouldShow = shouldShowDebugTool('performance', currentUser?.role)
  
  // If admin hasn't enabled performance budget, don't render anything
  if (!shouldShow) {
    return null
  }

  const [isVisible, setIsVisible] = useState(true)

  // Toggle visibility function
  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  const { } = usePerformanceMonitoring({
    onMetricsReady: (metrics) => {
      const newBudgets: PerformanceBudget[] = [
        {
          metric: 'Page Load Time',
          budget: 3000,
          current: metrics.pageLoadTime || 0,
          unit: 'ms',
          description: 'Total time to load the page',
          icon: Clock
        },
        {
          metric: 'First Contentful Paint',
          budget: 1800,
          current: metrics.firstContentfulPaintTime || 0,
          unit: 'ms',
          description: 'Time until first content appears',
          icon: Zap
        },
        {
          metric: 'Largest Contentful Paint',
          budget: 2500,
          current: metrics.largestContentfulPaintTime || 0,
          unit: 'ms',
          description: 'Time until largest content is visible',
          icon: TrendingUp
        },
        {
          metric: 'First Input Delay',
          budget: 100,
          current: metrics.firstInputDelayTime || 0,
          unit: 'ms',
          description: 'Time to first user interaction',
          icon: Zap
        }
      ]

      setBudgets(newBudgets)

      // Calculate overall score
      const scores = newBudgets.map(budget => {
        const percentage = (budget.current / budget.budget) * 100
        if (percentage <= 80) return 100
        if (percentage <= 100) return 80
        if (percentage <= 120) return 60
        return 40
      })
      
      const average = scores.reduce((a, b) => a + b, 0) / scores.length
      setOverallScore(Math.round(average))
    }
  })

  const getBudgetStatus = (current: number, budget: number) => {
    const percentage = (current / budget) * 100
    if (percentage <= 80) return { status: 'excellent', color: 'bg-green-500', textColor: 'text-green-700' }
    if (percentage <= 100) return { status: 'good', color: 'bg-yellow-500', textColor: 'text-yellow-700' }
    if (percentage <= 120) return { status: 'needs-improvement', color: 'bg-orange-500', textColor: 'text-orange-700' }
    return { status: 'poor', color: 'bg-red-500', textColor: 'text-red-700' }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Show only if visible
  if (!isVisible) {
    // Show a small toggle button when hidden
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleVisibility}
          className="bg-primary text-primary-foreground hover:bg-primary/90 p-2 rounded-full shadow-lg"
          title="Show Performance Budget"
        >
          <TrendingUp className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Budget
            <Badge className={`ml-auto ${getScoreColor(overallScore)}`}>
              Score: {overallScore}/100
            </Badge>
            <button
              onClick={toggleVisibility}
              className="ml-2 hover:bg-muted p-1 rounded"
              title="Hide Performance Budget"
            >
              <X className="h-4 w-4" />
            </button>
          </CardTitle>
          <CardDescription>
            Real-time performance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgets.map((budget) => {
            const status = getBudgetStatus(budget.current, budget.budget)
            const percentage = Math.min((budget.current / budget.budget) * 100, 100)
            const Icon = budget.icon

            return (
              <div key={budget.metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{budget.metric}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {status.status === 'excellent' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : status.status === 'poor' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : null}
                    <span className="text-sm">
                      {budget.current.toFixed(0)}{budget.unit}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{budget.description}</span>
                    <span>Budget: {budget.budget}{budget.unit}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
})

PerformanceBudgetComponent.displayName = 'PerformanceBudget'
export const PerformanceBudget = PerformanceBudgetComponent
