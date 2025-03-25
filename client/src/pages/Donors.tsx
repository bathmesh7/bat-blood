import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

interface Donor {
  id: number;
  fullName: string;
  bloodGroup: string;
  city: string;
  state: string;
  lastDonation: string | null;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Donors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [location, setLocation] = useState('');
  
  // Fetch all donors with optional filters
  const { data: donors, isLoading, refetch } = useQuery<Donor[]>({
    queryKey: ['/api/donors', { bloodGroup, location, search: searchTerm }],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-heading font-bold text-3xl text-neutral-800">Donor Directory</h2>
          <p className="mt-2 text-neutral-500">Find blood donors in your area</p>
        </div>
        
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="search-term" className="mb-1 block">Search</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-neutral-500" />
                    </div>
                    <Input
                      id="search-term"
                      placeholder="Search by name or location"
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="blood-group-filter" className="mb-1 block">Blood Group</Label>
                  <Select value={bloodGroup} onValueChange={setBloodGroup}>
                    <SelectTrigger id="blood-group-filter">
                      <SelectValue placeholder="All blood groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All blood groups</SelectItem>
                      {bloodGroups.map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="location-filter" className="mb-1 block">Location</Label>
                  <Input
                    id="location-filter"
                    placeholder="City or state"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-red-700 text-white"
                >
                  Search Donors
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Donor Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : donors && donors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor) => (
              <Card key={donor.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center text-red-800 font-bold mr-4">
                      {getInitials(donor.fullName)}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg text-neutral-800">
                        {donor.fullName}
                      </h3>
                      <p className="text-neutral-500 text-sm">
                        {donor.city}, {donor.state}
                      </p>
                      <div className="mt-1 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                          {donor.bloodGroup}
                        </span>
                        <span className="text-sm text-neutral-500">
                          Last donated: {donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                      Contact Donor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No donors found</h3>
            <p className="text-neutral-500">Try adjusting your search filters or register as a donor yourself!</p>
            <Button className="mt-4 bg-primary hover:bg-red-700 text-white">
              Register as Donor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
