// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { Building2 } from 'lucide-react';
// import toast from 'react-hot-toast';

// type AuthMode = 'signin' | 'signup';
// type UserType = 'mieszkaniec' | 'przedsiebiorca';

// export default function Auth() {
//   const [mode, setMode] = useState<AuthMode>('signin');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [fullName, setFullName] = useState('');
//   const [userType, setUserType] = useState<UserType>('przedsiebiorca');
//   const [loading, setLoading] = useState(false);

//   const { signIn, signUp } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (mode === 'signin') {
//         await signIn(email, password);
//         toast.success('Zalogowano pomyślnie!');
//       } else {
//         await signUp(email, password, userType, fullName);
//         toast.success('Konto zostało utworzone pomyślnie!');
//       }
//       navigate('/dashboard');
//     } catch (error) {
//       console.error('Błąd autoryzacji:', error);
//       toast.error(error instanceof Error ? error.message : 'Błąd autoryzacji');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <div className="flex justify-center mb-6">
//           <Building2 className="h-12 w-12 text-blue-600" />
//         </div>

//         <h2 className="text-2xl font-bold text-center mb-6">
//           {mode === 'signin' ? 'Zaloguj się' : 'Utwórz konto'}
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {mode === 'signup' && (
//             <>
//               <div>
//                 <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
//                   Imię i nazwisko
//                 </label>
//                 <input
//                   id="fullName"
//                   type="text"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Typ użytkownika
//                 </label>
//                 <div className="mt-1 space-x-4">
//                   <label className="inline-flex items-center">
//                     <input
//                       type="radio"
//                       value="mieszkaniec"
//                       checked={userType === 'mieszkaniec'}
//                       onChange={(e) => setUserType(e.target.value as UserType)}
//                       className="text-blue-600 focus:ring-blue-500"
//                     />
//                     <span className="ml-2">mieszkaniec</span>
//                   </label>
//                   <label className="inline-flex items-center">
//                     <input
//                       type="radio"
//                       value="przedsiebiorca"
//                       checked={userType === 'przedsiebiorca'}
//                       onChange={(e) => setUserType(e.target.value as UserType)}
//                       className="text-blue-600 focus:ring-blue-500"
//                     />
//                     <span className="ml-2">Przedsiębiorca</span>
//                   </label>
//                 </div>
//               </div>
//             </>
//           )}

//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//               required
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//               Hasło
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
//           >
//             {loading ? 'Przetwarzanie...' : mode === 'signin' ? 'Zaloguj się' : 'Utwórz konto'}
//           </button>
//         </form>

//         <div className="mt-4 text-center">
//           <button
//             onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
//             className="text-sm text-blue-600 hover:text-blue-500"
//           >
//             {mode === 'signin' ? "Nie masz konta? Zarejestruj się" : 'Masz już konto? Zaloguj się'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// Auth.tsx (część 1)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase'; // Importuj Supabase

type AuthMode = 'signin' | 'signup' | 'signupAdmin'; // Dodaj signupAdmin
type UserType = 'mieszkaniec' | 'przedsiebiorca';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userType, setUserType] = useState<UserType>('mieszkaniec');
  const [nip, setNip] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Dodaj stan dla admina

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const signUpAdmin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Błąd podczas rejestracji administratora:', error);
      toast.error(error.message);
      return null;
    }

    console.log('Administrator zarejestrowany:', data.user);
    return data.user;
  };

  const addAdminToken = async (userId: string, adminToken: string) => {
    const { error } = await supabase
      .from('admin_tokens')
      .insert([{ user_id: userId, token: adminToken }]);

    if (error) {
      console.error('Błąd podczas dodawania tokena administratora:', error);
      toast.error(error.message);
      return false;
    }

    console.log('Token administratora został dodany pomyślnie.');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        toast.success('Zalogowano pomyślnie!');
        navigate('/dashboard');
      } else if (mode === 'signup') {
        await signUp(
          email,
          password,
          userType,
          companyName,
          userType === 'przedsiebiorca' ? nip : ''
        );
        toast.success('Konto zostało utworzone pomyślnie!');
        navigate('/dashboard');
      } else if (mode === 'signupAdmin') {
        const user = await signUpAdmin(email, password);
        if (user) {
          await addAdminToken(user.id, 'msk_2025_admin_token'); // Zastąp unikalnym tokenem
          toast.success('Administrator zarejestrowany i uprawnienia nadane!');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Błąd autoryzacji:', error);
      toast.error(error instanceof Error ? error.message : 'Błąd autoryzacji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Building2 className="h-12 w-12 text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">
          {mode === 'signin'
            ? 'Zaloguj się'
            : mode === 'signupAdmin'
            ? 'Utwórz konto administratora'
            : 'Utwórz konto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              {/* ... (reszta formularza dla zwykłego użytkownika) ... */}
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {userType === 'mieszkaniec'
                    ? 'Nazwa użytkownika'
                    : 'Nazwa firmy'}
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required={userType === 'mieszkaniec'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Typ użytkownika
                </label>
                <div className="mt-1 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="mieszkaniec"
                      checked={userType === 'mieszkaniec'}
                      onChange={(e) => setUserType(e.target.value as UserType)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">przedsiebiorca</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="przedsiebiorca"
                      checked={userType === 'przedsiebiorca'}
                      onChange={(e) => setUserType(e.target.value as UserType)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Przedsiębiorca</span>
                  </label>
                </div>
              </div>

              {userType === 'przedsiebiorca' && (
                <div>
                  <label
                    htmlFor="nip"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Numer NIP
                  </label>
                  <input
                    id="nip"
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required={userType === 'przedsiebiorca'}
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Hasło
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading
              ? 'Przetwarzanie...'
              : // Auth.tsx (część 2)

              mode === 'signin'
              ? 'Zaloguj się'
              : mode === 'signupAdmin'
              ? 'Utwórz konto administratora'
              : 'Utwórz konto'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() =>
              setMode(
                mode === 'signin'
                  ? 'signup'
                  : mode === 'signupAdmin'
                  ? 'signin'
                  : 'signin'
              )
            }
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {mode === 'signin'
              ? 'Nie masz konta? Zarejestruj się'
              : mode === 'signupAdmin'
              ? 'Masz już konto? Zaloguj się'
              : 'Masz już konto? Zaloguj się'}
          </button>
          {mode !== 'signupAdmin' && (
            <button
              onClick={() => setMode('signupAdmin')}
              className="mt-2 text-sm text-blue-600 hover:text-blue-500"
            >
              Utwórz konto administratora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
