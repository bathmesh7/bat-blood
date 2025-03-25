import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';

interface Donor {
  id: number;
  fullName: string;
  bloodGroup: string;
  city: string;
  state: string;
  lastDonation: string | null;
}

export default function Home() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: donors, isLoading } = useQuery<Donor[]>({
    queryKey: ['/api/donors/latest'],
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  const handleBecomeDonor = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/register');
    }
  };

  const handleFindDonor = () => {
    navigate('/donors');
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-neutral-800 mb-6">
              Donate blood, <span className="text-primary">save lives</span>
            </h1>
            <p className="text-lg text-neutral-800 mb-8">
              Join our community of donors and make a real difference. Every donation can save up to three lives.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                className="px-6 py-3 bg-primary hover:bg-red-700 text-white"
                onClick={handleBecomeDonor}
              >
                Become a donor
              </Button>
              <Button 
                variant="outline" 
                className="px-6 py-3 border-neutral-400 text-neutral-800 bg-white hover:bg-neutral-50"
                onClick={handleFindDonor}
              >
                Find a donor
              </Button>
            </div>
          </div>
          <div className="mt-12 lg:mt-0 lg:col-span-6">
            <Card className="shadow-xl overflow-hidden">
              <div className="h-64 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <CardContent className="p-6">
                <h2 className="font-heading font-semibold text-xl text-neutral-800 mb-3">Latest donors</h2>
                <div className="space-y-4">
                  {isLoading ? (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-4 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : donors && donors.length > 0 ? (
                    donors.map(donor => (
                      <div key={donor.id} className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-800">
                          {getInitials(donor.fullName)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-neutral-800">{donor.fullName}</div>
                          <div className="text-sm text-neutral-500">
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">{donor.bloodGroup}</span>
                            <span> {donor.city}, {donor.state} • Last donated: {donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'Never'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-neutral-500">
                      No donors found. Be the first to register!
                    </div>
                  )}
                </div>
                <Link href="/donors">
                  <Button variant="outline" className="mt-4 w-full border-primary text-primary hover:bg-red-50">
                    View all donors
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
