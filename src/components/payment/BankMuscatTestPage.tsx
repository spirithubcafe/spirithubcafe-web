import React, { useState } from 'react';
import './BankMuscatTestPage.css';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

interface TestStats {
  total: number;
  passed: number;
  failed: number;
}

const BankMuscatTestPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState<TestStats>({ total: 0, passed: 0, failed: 0 });
  const [selectedTest, setSelectedTest] = useState<string>('all');

  // Test configuration
  const testConfig = {
    amount: 5.5,
    currency: 'OMR',
    orderId: `TEST_${Date.now()}`,
    customerEmail: 'test@spirithubcafe.com'
  };

  /**
   * Add test result
   */
  const addTestResult = (success: boolean, message: string, data?: any) => {
    const result: TestResult = { success, message, data };
    setTestResults(prev => [...prev, result]);
    setStats(prev => ({
      total: prev.total + 1,
      passed: prev.passed + (success ? 1 : 0),
      failed: prev.failed + (success ? 0 : 1)
    }));
  };

  /**
   * Clear test results
   */
  const clearResults = () => {
    setTestResults([]);
    setStats({ total: 0, passed: 0, failed: 0 });
  };

  /**
   * Test payment creation
   */
  const testCreatePayment = async () => {
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: testConfig.amount,
          currency: testConfig.currency,
          orderId: testConfig.orderId,
          customerEmail: testConfig.customerEmail,
          description: 'Test payment from React component'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addTestResult(
          true,
          'Payment creation successful',
          data.data
        );
        return data.data;
      } else {
        addTestResult(
          false,
          data.message || 'Payment creation failed',
          data
        );
        return null;
      }
    } catch (error) {
      addTestResult(
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return null;
    }
  };

  /**
   * Test payment status
   */
  const testPaymentStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/payments/confirm?orderId=${orderId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        addTestResult(
          true,
          'Status check successful',
          data
        );
        return data;
      } else {
        addTestResult(
          false,
          data.message || 'Status check failed',
          data
        );
        return null;
      }
    } catch (error) {
      addTestResult(
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return null;
    }
  };

  /**
   * Test form validation
   */
  const testFormValidation = () => {
    const tests = [
      { field: 'amount', value: '', expected: false, name: 'Empty amount' },
      { field: 'amount', value: '-5', expected: false, name: 'Negative amount' },
      { field: 'amount', value: '0', expected: false, name: 'Zero amount' },
      { field: 'amount', value: '5.50', expected: true, name: 'Valid amount' },
      { field: 'email', value: '', expected: false, name: 'Empty email' },
      { field: 'email', value: 'invalid-email', expected: false, name: 'Invalid email' },
      { field: 'email', value: 'test@example.com', expected: true, name: 'Valid email' },
    ];

    tests.forEach(test => {
      let isValid = true;
      
      if (test.field === 'amount') {
        const amount = parseFloat(test.value);
        isValid = !isNaN(amount) && amount > 0;
      } else if (test.field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(test.value);
      }

      const passed = isValid === test.expected;
      addTestResult(
        passed,
        `${test.name}: ${passed ? 'PASS' : 'FAIL'} (expected ${test.expected}, got ${isValid})`
      );
    });
  };

  /**
   * Test environment configuration
   */
  const testEnvironment = () => {
    const requiredEnvs = [
      { name: 'VITE_FIREBASE_PROJECT_ID', description: 'Firebase Project ID' },
      { name: 'VITE_FIREBASE_API_KEY', description: 'Firebase API Key' },
      { name: 'VITE_FIREBASE_AUTH_DOMAIN', description: 'Firebase Auth Domain' }
    ];

    let allPresent = true;

    requiredEnvs.forEach(env => {
      const value = import.meta.env[env.name];
      const isPresent = !!value;
      
      if (!isPresent) allPresent = false;
      
      addTestResult(
        isPresent,
        `${env.description}: ${isPresent ? 'PRESENT' : 'MISSING'}`
      );
    });

    addTestResult(
      allPresent,
      `Overall environment check: ${allPresent ? 'ALL GOOD' : 'SOME MISSING'}`
    );
  };

  /**
   * Run selected tests
   */
  const runTests = async () => {
    setIsLoading(true);
    clearResults();

    try {
      if (selectedTest === 'all' || selectedTest === 'environment') {
        testEnvironment();
      }

      if (selectedTest === 'all' || selectedTest === 'validation') {
        testFormValidation();
      }

      if (selectedTest === 'all' || selectedTest === 'payment') {
        const paymentData = await testCreatePayment();
        
        if (paymentData && paymentData.orderId) {
          // Wait a bit before testing status
          setTimeout(() => {
            testPaymentStatus(paymentData.orderId);
          }, 2000);
        }
      }
    } catch (error) {
      addTestResult(
        false,
        `Test execution error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Open payment URL for manual testing
   */
  const openPaymentUrl = async () => {
    const paymentData = await testCreatePayment();
    
    if (paymentData && paymentData.redirectUrl) {
      window.open(paymentData.redirectUrl, '_blank');
    }
  };

  return (
    <div className="test-page">
      <div className="test-header">
        <h1>🏦 Bank Muscat Payment Gateway Tests</h1>
        <p>Test your payment integration before going live</p>
      </div>

      <div className="test-controls">
        <div className="test-selector">
          <label htmlFor="test-type">Select Test:</label>
          <select 
            id="test-type"
            value={selectedTest} 
            onChange={(e) => setSelectedTest(e.target.value)}
            disabled={isLoading}
          >
            <option value="all">All Tests</option>
            <option value="environment">Environment Check</option>
            <option value="validation">Form Validation</option>
            <option value="payment">Payment API</option>
          </select>
        </div>

        <div className="test-buttons">
          <button 
            onClick={runTests} 
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? '🔄 Testing...' : '▶️ Run Tests'}
          </button>
          
          <button 
            onClick={openPaymentUrl} 
            disabled={isLoading}
            className="btn-secondary"
          >
            🌐 Test Payment Flow
          </button>
          
          <button 
            onClick={clearResults}
            disabled={isLoading}
            className="btn-clear"
          >
            🗑️ Clear Results
          </button>
        </div>
      </div>

      <div className="test-config">
        <h3>Test Configuration</h3>
        <div className="config-grid">
          <div className="config-item">
            <strong>Amount:</strong> {testConfig.amount} {testConfig.currency}
          </div>
          <div className="config-item">
            <strong>Order ID:</strong> {testConfig.orderId}
          </div>
          <div className="config-item">
            <strong>Email:</strong> {testConfig.customerEmail}
          </div>
          <div className="config-item">
            <strong>Environment:</strong> {import.meta.env.MODE}
          </div>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="test-stats">
          <h3>Test Results Summary</h3>
          <div className="stats-grid">
            <div className="stat-item total">
              <strong>Total:</strong> {stats.total}
            </div>
            <div className="stat-item passed">
              <strong>Passed:</strong> {stats.passed}
            </div>
            <div className="stat-item failed">
              <strong>Failed:</strong> {stats.failed}
            </div>
            <div className="stat-item success-rate">
              <strong>Success Rate:</strong> {((stats.passed / stats.total) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      <div className="test-results">
        <h3>Test Results</h3>
        {testResults.length === 0 ? (
          <div className="no-results">
            <p>No test results yet. Click "Run Tests" to start.</p>
          </div>
        ) : (
          <div className="results-list">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`result-item ${result.success ? 'success' : 'failure'}`}
              >
                <div className="result-icon">
                  {result.success ? '✅' : '❌'}
                </div>
                <div className="result-content">
                  <div className="result-message">{result.message}</div>
                  {result.data && (
                    <details className="result-data">
                      <summary>View Details</summary>
                      <pre>{JSON.stringify(result.data, null, 2)}</pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="test-instructions">
        <h3>Testing Instructions</h3>
        <ol>
          <li><strong>Environment Check:</strong> Verifies all required environment variables are set</li>
          <li><strong>Form Validation:</strong> Tests input validation logic</li>
          <li><strong>Payment API:</strong> Tests payment creation and status endpoints</li>
          <li><strong>Manual Testing:</strong> Use "Test Payment Flow" to open actual payment page</li>
        </ol>
        
        <div className="test-cards">
          <h4>Bank Muscat Test Cards</h4>
          <div className="card-info">
            <p><strong>Success:</strong> 5123456789012346 (Exp: 05/21, CVV: 100)</p>
            <p><strong>Failure:</strong> 5123456789012353 (Exp: 05/21, CVV: 100)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankMuscatTestPage;