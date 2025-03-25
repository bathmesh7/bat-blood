import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth.tsx';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, User, MapPin, Phone, Calendar } from 'lucide-react';

interface User {
  id: number;
  fullName: string;
  age: number;
  email: string;
  phone: string;
  bloodGroup: string;
  city: string;
  state: string;
  lastDonation: string | null;
}

interface Donation {
  id: number;
  userId: number;
  donationDate: string;
  location: string;
  units: number;
  status: string;
}

const donationFormSchema = z.object({
  donationDate: z.string().min(1, 'Donation date is required'),
  location: z.string().min(1, 'Location is required'),
  units: z.coerce.number().min(1, 'Minimum of 1 unit required').default(1),
});

type DonationFormValues = z.infer<typeof donationFormSchema>;

export default function Profile() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddDonationOpen, setIsAddDonationOpen] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Fetch user data
  const { data: userData, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    enabled: isAuthenticated,
  });

  // Fetch donation history
  const { data: donations, isLoading: isDonationsLoading } = useQuery<Donation[]>({
    queryKey: ['/api/donations'],
    enabled: isAuthenticated,
  });

  // Add donation form
  const donationForm = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      donationDate: new Date().toISOString().split('T')[0],
      location: '',
      units: 1,
    },
  });

  // Add donation mutation
  const addDonationMutation = useMutation({
    mutationFn: async (values: DonationFormValues) => {
      const res = await apiRequest('POST', '/api/donations', values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsAddDonationOpen(false);
      toast({
        title: 'Donation Added',
        description: 'Your donation record has been added successfully.',
      });
      donationForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add donation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onAddDonation = (values: DonationFormValues) => {
    addDonationMutation.mutate(values);
  };

  // Calculate when the user is eligible to donate again (56 days from last donation)
  const getEligibilityDate = () => {
    if (!userData?.lastDonation) return null;
    
    const lastDonationDate = new Date(userData.lastDonation);
    const eligibilityDate = new Date(lastDonationDate);
    eligibilityDate.setDate(eligibilityDate.getDate() + 56); // 56 days (8 weeks) between donations
    
    return eligibilityDate;
  };

  const getDaysUntilEligible = () => {
    const eligibilityDate = getEligibilityDate();
    if (!eligibilityDate) return 0;
    
    const today = new Date();
    const diffTime = eligibilityDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.fullName) return '';
    return userData.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (isUserLoading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-96 rounded-lg" />
            <div className="md:col-span-2 space-y-8">
              <Skeleton className="h-80 rounded-lg" />
              <Skeleton className="h-60 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4">
                      {getUserInitials()}
                    </div>
                    <h2 className="font-heading font-semibold text-xl text-neutral-800">{userData?.fullName}</h2>
                    <p className="text-neutral-500">{userData?.email}</p>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      {userData?.bloodGroup}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-neutral-50">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-neutral-500 mr-2" />
                      <span className="text-sm text-neutral-800">{userData?.age} years old</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-neutral-500 mr-2" />
                      <span className="text-sm text-neutral-800">{userData?.city}, {userData?.state}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-neutral-500 mr-2" />
                      <span className="text-sm text-neutral-800">{userData?.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-neutral-500 mr-2" />
                      <span className="text-sm text-neutral-800">
                        Last donated: {userData?.lastDonation ? new Date(userData.lastDonation).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-red-50">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation History */}
          <div className="md:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 border-b border-neutral-200">
                  <h3 className="font-heading font-semibold text-xl text-neutral-800">Donation History</h3>
                </div>
                <div className="p-6">
                  {isDonationsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : donations && donations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Location</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Units</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {donations.map((donation) => (
                            <tr key={donation.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                                {new Date(donation.donationDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                                {donation.location}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                                {donation.units}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-neutral-500">No donation records found. Add your first donation below.</p>
                    </div>
                  )}
                  <div className="mt-6">
                    <Button 
                      className="bg-primary hover:bg-red-700 text-white"
                      onClick={() => setIsAddDonationOpen(true)}
                    >
                      Add New Donation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 border-b border-neutral-200">
                  <h3 className="font-heading font-semibold text-xl text-neutral-800">Upcoming Donation Eligibility</h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center">
                        <div className="font-heading font-bold text-2xl text-primary">
                          {userData?.lastDonation ? getDaysUntilEligible() : 'Ready'}
                        </div>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-neutral-200 text-sm font-medium text-neutral-800">
                        {userData?.lastDonation ? 'Days left' : 'to donate'}
                      </div>
                    </div>
                    <p className="text-neutral-800 text-center max-w-md">
                      {userData?.lastDonation ? (
                        <>
                          Based on your last donation on {new Date(userData.lastDonation).toLocaleDateString()}, 
                          you will be eligible to donate again on {getEligibilityDate()?.toLocaleDateString()}.
                        </>
                      ) : (
                        'You have not recorded any donations yet. You are eligible to donate right away!'
                      )}
                    </p>
                    <div className="mt-6">
                      <Button className="bg-primary hover:bg-red-700 text-white">
                        Schedule Next Donation
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Donation Dialog */}
      <Dialog open={isAddDonationOpen} onOpenChange={setIsAddDonationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Donation</DialogTitle>
            <DialogDescription>
              Record your blood donation details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...donationForm}>
            <form onSubmit={donationForm.handleSubmit(onAddDonation)} className="space-y-4">
              <FormField
                control={donationForm.control}
                name="donationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Donation Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Donation Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Blood Bank, Hospital, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="units"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Units Donated</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDonationOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-red-700 text-white"
                  disabled={addDonationMutation.isPending}
                >
                  {addDonationMutation.isPending ? 'Saving...' : 'Save Donation'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
