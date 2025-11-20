import { RegisterForm } from './components/RegisterForm'; // Importa el formulario
import { Copyright } from '@/components/shared'; // Ajusta la ruta
// import Logo from '@/public/images/logo.png'; // Descomenta si tienes un logo

export default function RegisterPage() {
  return (
    <div className="bg-white bg-opacity-90 rounded-lg shadow-xl overflow-hidden max-w-md w-full border border-zinc-200 z-10">
          <div className="p-8">
            <div className="text-center mb-5">
              <div className="mx-auto w-auto relative">
                <h2
                  className="text-start mb-10 bg-white px-2 text-gray-800 text-lg font-semibold"
                >MedicApp</h2>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-4">Crea tu cuenta</h2>
            </div>
            <RegisterForm />
          </div>
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <Copyright />
          </div>
        </div>
  );
}