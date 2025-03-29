import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface UserProfile {
  full_name: string;
  email: string;
  user_type: string;
  nip?: string;
  industry?: string;
  company_description?: string;
  facebook_link?: string;
  instagram_link?: string;
  tiktok_link?: string;
  website_link?: string;
  phone1?: string;
  phone2?: string;
  logo_url?: string;
  karta_lodzianina?: string;
  created_at: string;
}

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();

  const {
    data: userProfile,
    isLoading,
    isError,
  } = useQuery<UserProfile, Error>(['userProfile', id], async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (isError) {
    toast.error('Failed to load company profile');
    return (
      <div className="text-center py-8">Failed to load company profile.</div>
    );
  }

  if (!userProfile) {
    return <div className="text-center py-8">Company profile not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          {userProfile.logo_url && (
            <img
              src={userProfile.logo_url}
              alt="Company Logo"
              className="w-20 h-20 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{userProfile.full_name}</h1>
            <p className="text-gray-600">{userProfile.email}</p>
          </div>
        </div>

        {userProfile.company_description && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Company Description</h2>
            <p className="text-gray-700">{userProfile.company_description}</p>
          </div>
        )}

        {userProfile.nip && (
          <p className="mb-2">
            <strong>NIP:</strong> {userProfile.nip}
          </p>
        )}

        {userProfile.industry && (
          <p className="mb-2">
            <strong>Industry:</strong> {userProfile.industry}
          </p>
        )}

        {userProfile.facebook_link && (
          <p className="mb-2">
            <strong>Facebook:</strong>{' '}
            <a
              href={userProfile.facebook_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {userProfile.facebook_link}
            </a>
          </p>
        )}

        {userProfile.instagram_link && (
          <p className="mb-2">
            <strong>Instagram:</strong>{' '}
            <a
              href={userProfile.instagram_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {userProfile.instagram_link}
            </a>
          </p>
        )}

        {userProfile.tiktok_link && (
          <p className="mb-2">
            <strong>TikTok:</strong>{' '}
            <a
              href={userProfile.tiktok_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {userProfile.tiktok_link}
            </a>
          </p>
        )}

        {userProfile.website_link && (
          <p className="mb-2">
            <strong>Website:</strong>{' '}
            <a
              href={userProfile.website_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {userProfile.website_link}
            </a>
          </p>
        )}

        {userProfile.phone1 && (
          <p className="mb-2">
            <strong>Phone 1:</strong> {userProfile.phone1}
          </p>
        )}

        {userProfile.phone2 && (
          <p className="mb-2">
            <strong>Phone 2:</strong> {userProfile.phone2}
          </p>
        )}

        <p className="text-sm text-gray-500 mt-4">
          Created at: {format(new Date(userProfile.created_at), 'MMM d, yyyy')}
        </p>
      </div>
    </div>
  );
}
