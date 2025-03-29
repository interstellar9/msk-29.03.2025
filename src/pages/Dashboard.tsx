import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, MessageSquare, Plus, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Listing, Message, User as UserType } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type Tab = 'listings' | 'messages' | 'profile';

interface PublicUrlResponse {
  publicUrl: string;
  error: any;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyDescription, setCompanyDescription] = useState<string>('');
  const [facebookLink, setFacebookLink] = useState<string>('');
  const [instagramLink, setInstagramLink] = useState<string>('');
  const [tiktokLink, setTiktokLink] = useState<string>('');
  const [websiteLink, setWebsiteLink] = useState<string>('');
  const [phone1, setPhone1] = useState<string>('');
  const [phone2, setPhone2] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchUserData();
  }, [user, activeTab]);

  async function fetchUserData() {
    try {
      setLoading(true);

      if (activeTab === 'listings') {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      }

      if (activeTab === 'messages') {
        const { data, error } = await supabase
          .from('messages')
          .select(
            `
                        *,
                        sender:sender_id(full_name),
                        recipient:recipient_id(full_name)
                    `
          )
          .or(
            `sender_id.eq.<span class="math-inline">\{user?\.id\},recipient\_id\.eq\.</span>{user?.id}`
          )
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      }
      if (activeTab === 'profile') {
        setCompanyDescription(user?.company_description || '');
        setFacebookLink(user?.facebook_link || '');
        setInstagramLink(user?.instagram_link || '');
        setTiktokLink(user?.tiktok_link || '');
        setWebsiteLink(user?.website_link || '');
        setPhone1(user?.phone || '');
        setPhone2(user?.phone2 || '');
        setLogoUrl(user?.logo_url || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteListing(listingId: string) {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      setListings(listings.filter((listing) => listing.id !== listingId));
      toast.success('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const updateUser = async (updatedData: Partial<UserType>) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from('users')
      .update(updatedData)
      .eq('id', user.id);
    if (error) {
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      let logo_url = user?.logo_url;

      if (logoFile) {
        const filePath = `logos/<span class="math-inline">\{user?\.id\}\-</span>{logoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(filePath, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { publicUrl, error: urlError } = (await supabase.storage
          .from('public')
          .getPublicUrl(filePath)) as unknown as PublicUrlResponse;

        if (urlError) throw urlError;

        logo_url = publicUrl;
      }

      await updateUser({
        company_description: companyDescription,
        facebook_link: facebookLink,
        instagram_link: instagramLink,
        tiktok_link: tiktokLink,
        website_link: websiteLink,
        phone: phone1,
        phone2: phone2,
        logo_url: logo_url,
      });

      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleShowProfile = () => {
    if (!user) return;
    navigate(`/profile/${user.id}`);
  };
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.full_name}</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'listings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-5 h-5 inline-block mr-2" />
              Listings
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-5 h-5 inline-block mr-2" />
              Messages
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-5 h-5 inline-block mr-2" />
              Profile Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'listings' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Your Listings</h2>
                    <Link
                      to="/create-listing"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create New Listing
                    </Link>
                  </div>

                  {listings.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        You haven't created any listings yet
                      </p>
                      <Link
                        to="/create-listing"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Create your first listing
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {listings.map((listing) => (
                        <div
                          key={listing.id}
                          className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="p-6">
                            <h3 className="text-lg font-semibold mb-2">
                              {listing.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {listing.description}
                            </p>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>{listing.category}</span>
                              <span>
                                {format(
                                  new Date(listing.created_at),
                                  'MMM d, yyyy'
                                )}
                              </span>
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                              <Link
                                to={`/listings/${listing.id}`}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                View Details
                              </Link>
                              <button
                                onClick={() => handleDeleteListing(listing.id)}
                                className="text-red-600 hover:text-red-700 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Your Messages</h2>
                  {messages.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-blue-50 ml-12'
                              : 'bg-gray-50 mr-12'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">
                              {message.sender_id === user?.id
                                ? 'You'
                                : message.sender?.full_name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {format(
                                new Date(message.created_at),
                                'MMM d, yyyy h:mm a'
                              )}
                            </span>
                          </div>
                          <p className="text-gray-700">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">
                    Profile Settings
                  </h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user?.full_name || ''}
                          className="w-full px-3 py-2 border rounded-md bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="w-full px-3 py-2 border rounded-md bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          User Type
                        </label>
                        <input
                          type="text"
                          value={user?.user_type || ''}
                          readOnly
                          className="w-full px-3 py-2 border rounded-md bg-gray-100"
                        />
                      </div>
                      {user?.user_type === 'przedsiebiorca' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              NIP
                            </label>
                            <input
                              type="text"
                              value={user?.nip || ''}
                              className="w-full px-3 py-2 border rounded-md bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Industry
                            </label>
                            <input
                              type="text"
                              value={user?.industry || ''}
                              className="w-full px-3 py-2 border rounded-md bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Opis firmy
                            </label>
                            <textarea
                              value={companyDescription}
                              onChange={(e) =>
                                setCompanyDescription(e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-md"
                              maxLength={255}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Link do Facebooka
                            </label>
                            <input
                              type="url"
                              value={facebookLink}
                              onChange={(e) => setFacebookLink(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Link do Instagrama
                            </label>
                            <input
                              type="url"
                              value={instagramLink}
                              onChange={(e) => setInstagramLink(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Link do TikToka
                            </label>
                            <input
                              type="url"
                              value={tiktokLink}
                              onChange={(e) => setTiktokLink(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Link do strony www
                            </label>
                            <input
                              type="url"
                              value={websiteLink}
                              onChange={(e) => setWebsiteLink(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Numer telefonu kontaktowego 1
                            </label>
                            <input
                              type="tel"
                              value={phone1}
                              onChange={(e) => setPhone1(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                              required={!phone2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Numer telefonu kontaktowego 2 (opcjonalnie)
                            </label>
                            <input
                              type="tel"
                              value={phone2}
                              onChange={(e) => setPhone2(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md"
                              required={!phone1}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Logo firmy (JPG lub PNG)
                            </label>
                            <input
                              type="file"
                              accept="image/jpeg, image/png"
                              onChange={handleLogoChange}
                              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {logoUrl && (
                              <img
                                src={logoUrl}
                                alt="Logo firmy"
                                className="mt-2 max-h-20"
                              />
                            )}
                          </div>
                        </>
                      )}
                      {user?.user_type === 'mieszkaniec' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Karta Łodzianina
                          </label>
                          <input
                            type="text"
                            value={user?.karta_lodzianina || ''}
                            readOnly
                            className="w-full px-3 py-2 border rounded-md bg-gray-100"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mt-4"
                    >
                      Zapisz
                    </button>
                  </div>
                  <div>
                    <p>Zobacz jak widzą Twój profil inni</p>
                    <button
                      onClick={handleShowProfile}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mt-4"
                    >
                      Pokaż
                    </button>
                  </div>
                </div>

                // <div>
                //   <h2 className="text-xl font-semibold mb-6">
                //     Profile Settings
                //   </h2>
                //   <div className="bg-gray-50 p-6 rounded-lg">
                //     <div className="grid gap-6 md:grid-cols-2">
                //       <div>
                //         <label className="block text-sm font-medium text-gray-700 mb-2">
                //           Full Name
                //         </label>
                //         <input
                //           type="text"
                //           value={user?.full_name || ''}
                //           readOnly
                //           className="w-full px-3 py-2 border rounded-md bg-gray-100"
                //         />
                //       </div>
                //       <div>
                //         <label className="block text-sm font-medium text-gray-700 mb-2">
                //           Email
                //         </label>
                //         <input
                //           type="email"
                //           value={user?.email || ''}
                //           readOnly
                //           className="w-full px-3 py-2 border rounded-md bg-gray-100"
                //         />
                //       </div>
                //       <div>
                //         <label className="block text-sm font-medium text-gray-700 mb-2">
                //           User Type
                //         </label>
                //         <input
                //           type="text"
                //           value={user?.user_type || ''}
                //           readOnly
                //           className="w-full px-3 py-2 border rounded-md bg-gray-100"
                //         />
                //       </div>
                //       {user?.user_type === 'przedsiebiorca' && (
                //         <>
                //           <div>
                //             <label className="block text-sm font-medium text-gray-700 mb-2">
                //               NIP
                //             </label>
                //             <input
                //               type="text"
                //               value={user?.nip || ''}
                //               readOnly
                //               className="w-full px-3 py-2 border rounded-md bg-gray-100"
                //             />
                //           </div>
                //           <div>
                //             <label className="block text-sm font-medium text-gray-700 mb-2">
                //               Industry
                //             </label>
                //             <input
                //               type="text"
                //               value={user?.industry || ''}
                //               readOnly
                //               className="w-full px-3 py-2 border rounded-md bg-gray-100"
                //             />
                //           </div>
                //         </>
                //       )}
                //       {user?.user_type === 'mieszkaniec' && (
                //         <div>
                //           <label className="block text-sm font-medium text-gray-700 mb-2">
                //             Karta Łodzianina
                //           </label>
                //           <input
                //             type="text"
                //             value={user?.karta_lodzianina || ''}
                //             readOnly
                //             className="w-full px-3 py-2 border rounded-md bg-gray-100"
                //           />
                //         </div>
                //       )}
                //     </div>
                //   </div>
                // </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
