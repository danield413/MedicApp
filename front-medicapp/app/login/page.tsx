import Image from 'next/image';
import { AuthForm } from './components/AuthForm';
import { Copyright } from '@/components/shared';
import Logo from '@/public/images/logo.png';

export default function LoginPage() {
  return (
    <div className="bg-white bg-opacity-90 rounded-lg shadow-xl overflow-hidden max-w-md w-full border border-zinc-200 z-10">
      <div className="p-8">
        <div className="text-center mb-5">
          <div className="mx-auto w-auto relative">
            <h2
              className="text-start mb-10 bg-white px-2 text-gray-800 text-lg font-semibold"
            >MedicApp</h2>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Bienvenido</h2>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>
        <AuthForm />
      </div>
      <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
        <Copyright />
      </div>
    </div>
  );
}
