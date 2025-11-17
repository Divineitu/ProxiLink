import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => (
  <div className="container mx-auto p-6">
    <Card>
      <CardHeader>
        <CardTitle>About ProxiLink</CardTitle>
      </CardHeader>
      <CardContent>
        <p>About page content goes here.</p>
      </CardContent>
    </Card>
  </div>
);

export default About;
