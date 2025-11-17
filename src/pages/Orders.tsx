import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Orders = () => (
  <div className="container mx-auto p-6">
    <Card>
      <CardHeader>
        <CardTitle>Past Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Your past orders will show here. (Demo placeholder)</p>
      </CardContent>
    </Card>
  </div>
);

export default Orders;
