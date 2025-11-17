import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Payments = () => (
  <div className="container mx-auto p-6">
    <Card>
      <CardHeader>
        <CardTitle>Payment Options</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Manage your payment methods here. (Demo placeholder)</p>
      </CardContent>
    </Card>
  </div>
);

export default Payments;
