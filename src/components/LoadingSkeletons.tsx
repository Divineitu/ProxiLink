import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const VendorCardSkeleton = () => (
  <Card className="animate-in fade-in-50 duration-500">
    <CardHeader className="p-3 sm:p-4 space-y-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-8 w-full mt-3" />
    </CardContent>
  </Card>
);

export const OrderCardSkeleton = () => (
  <Card className="animate-in fade-in-50 duration-500">
    <CardHeader className="p-4 sm:p-6 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    </CardHeader>
    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-40" />
      <div className="flex justify-between items-center pt-3">
        <Skeleton className="h-6 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ProfileSkeleton = () => (
  <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <Skeleton className="h-6 w-40 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-5 w-24 mx-auto sm:mx-0" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="p-4 sm:p-6 space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-4 animate-in fade-in-50 duration-500">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-3 sm:p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="p-3 sm:p-4 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-3 w-24" />
          </CardHeader>
        </Card>
      ))}
    </div>
  </div>
);

export const MessageListSkeleton = () => (
  <div className="space-y-3 animate-in fade-in-50 duration-500">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ServiceCardSkeleton = () => (
  <Card className="animate-in fade-in-50 duration-500">
    <CardHeader className="p-4 sm:p-6 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardHeader>
    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="border-t pt-3 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-9 w-full" />
    </CardContent>
  </Card>
);
