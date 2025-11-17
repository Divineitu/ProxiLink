import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

const ApiKeyDiagnostic = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [apiStatus, setApiStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApiKey = async () => {
      if (!apiKey) {
        setApiStatus('invalid');
        setError('No API key found in VITE_GOOGLE_MAPS_API_KEY');
        return;
      }

      try {
        console.log('Testing API key...');
        // Try to load Google Maps with the API key
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;

        let loaded = false;
        script.onload = () => {
          console.log('✓ Google Maps API loaded successfully');
          setApiStatus('valid');
          loaded = true;
        };

        script.onerror = () => {
          if (!loaded) {
            console.error('✗ Failed to load Google Maps API');
            setApiStatus('invalid');
            setError(
              'Failed to load Google Maps API. This usually means:\n' +
              '1. API key is invalid or expired\n' +
              '2. Maps JavaScript API is not enabled in your Google Cloud project\n' +
              '3. API key has usage restrictions that block this domain\n' +
              '4. Project is over quota'
            );
          }
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!loaded) {
            setApiStatus('invalid');
            setError('API key test timed out. Check your internet connection and Google Cloud Console.');
          }
        }, 5000);

        document.head.appendChild(script);
      } catch (err) {
        setApiStatus('invalid');
        setError(`Error testing API key: ${err}`);
      }
    };

    testApiKey();
  }, [apiKey]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Google Maps API Diagnostic</h1>
          <p className="text-muted-foreground">Check if your API key is properly configured</p>
        </div>

        {/* API Key Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {apiStatus === 'valid' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {apiStatus === 'invalid' && <AlertCircle className="h-5 w-5 text-red-500" />}
              {apiStatus === 'loading' && <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              API Status
            </CardTitle>
            <CardDescription>
              {apiStatus === 'loading' && 'Testing API key...'}
              {apiStatus === 'valid' && '✓ API key is working correctly'}
              {apiStatus === 'invalid' && '✗ API key configuration issue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiStatus === 'loading' && <p className="text-sm text-muted-foreground">Please wait...</p>}
            {apiStatus === 'valid' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your Google Maps API key is valid and working!
                </AlertDescription>
              </Alert>
            )}
            {apiStatus === 'invalid' && error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* API Key Details */}
        <Card>
          <CardHeader>
            <CardTitle>API Key Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current API Key:</p>
              <div className="bg-muted p-3 rounded font-mono text-sm break-all">
                {apiKey ? apiKey : 'No API key configured'}
              </div>
              {apiKey && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    toast.success('API key copied to clipboard');
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy API Key
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fix Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Fix Your API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">1. Check Google Cloud Console</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                <li>Select your project</li>
                <li>Go to APIs & Services → Enabled APIs & services</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Enable Required APIs</h3>
              <p className="mb-2">Make sure these are enabled:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Maps JavaScript API</strong> (required)</li>
                <li><strong>Places API</strong> (optional but recommended)</li>
                <li><strong>Geocoding API</strong> (optional)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Check API Key Restrictions</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Go to APIs & Services → Credentials</li>
                <li>Click on your API key</li>
                <li>Under "Application restrictions", ensure it's set to "None" or includes this domain</li>
                <li>Under "API restrictions", ensure all Maps APIs you need are included</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Check Billing</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Ensure billing is enabled on your Google Cloud project</li>
                <li>Check you haven't exceeded your quota</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Browser Console Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Open browser console (F12) to see detailed logs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => {
                console.clear();
                console.log('=== DIAGNOSTICS ===');
                console.log('API Key:', apiKey);
                console.log('Maps Status:', apiStatus);
                const _w = window as unknown as { google?: unknown };
                console.log('Window.google:', _w.google);
                console.log('Navigator.geolocation:', navigator.geolocation);
                toast.success('Diagnostics logged to console');
              }}
            >
              Log Diagnostics to Console
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiKeyDiagnostic;
