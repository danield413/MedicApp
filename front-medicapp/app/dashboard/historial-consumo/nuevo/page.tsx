'use client';

import {useState, useEffect} from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Select, SelectItem, Spinner } from '@heroui/react'; // Removed Checkbox
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// 1. Import the CORRECT schema and payload type
import { registroConsumoSchema, RegistroConsumoPayload } from '@/schema';
import {  addHistorialConsumo, fetchMedicamentos, MedicamentoSimple } from '@/services/historialService'; // Adjust path if needed

const AddHistorialForm = () => {
    const router = useRouter();
    const [medicamentos, setMedicamentos] = useState<MedicamentoSimple[]>([]);
    const [loadingMeds, setLoadingMeds] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        // control, // Likely not needed anymore
    } = useForm<RegistroConsumoPayload>({ // 2. Use the CORRECT payload type
        resolver: zodResolver(registroConsumoSchema), // 3. Use the CORRECT schema
        // 4. Removed defaultValues for recordatorio
    });

    // Load medications (no changes needed here)
    useEffect(() => {
        const cargarMedicamentos = async () => {
            setLoadingMeds(true);
            try {
                const meds = await fetchMedicamentos();
                setMedicamentos(meds);
            } catch (error: any) {
                toast.error('Error al cargar medicamentos: ' + error.message);
            } finally {
                setLoadingMeds(false);
            }
        };
        cargarMedicamentos();
    }, []);

    // 5. Use the CORRECT payload type in onSubmit
    const onSubmit: SubmitHandler<RegistroConsumoPayload> = async (data) => {
        setIsSubmitting(true);
        try {
            // Ensure you are calling the correct service function if you renamed it
            await addHistorialConsumo(data);
            toast.success('Registro de consumo añadido con éxito');
            router.push('/dashboard/historial-consumo');
            router.refresh();
        } catch (error: any) {
            toast.error(`Error al añadir: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Title moved to the page component */}
            <h1 className="text-3xl font-bold mb-20 dark:text-white">Agregar Nuevo Registro de Consumo</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full md:w-8/12 lg:w-6/12 mx-auto"> {/* Centered form */}
                {/* --- Section for Medication Selection --- */}
                <div>
                    <label htmlFor="medicamento" className="block text-sm font-medium mb-1 dark:text-gray-300">Medicamento *</label>
                    {loadingMeds ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Spinner size="sm" /> Cargando medicamentos...
                        </div>
                    ) : (
                        <Select
                            id="medicamento"
                            label="Medicamento *" // HeroUI might use label prop
                            placeholder="Selecciona un medicamento" // Optional if label is used
                            {...register('medicamento')}
                            isDisabled={medicamentos.length === 0}
                            isInvalid={!!errors.medicamento}
                            errorMessage={errors.medicamento?.message}
                            className='w-full mb-6' // Ensure Select takes full width
                        >
                            {medicamentos.map((med) => (
                                // Ensure SelectItem exists and is used correctly for HeroUI
                                <SelectItem key={med._id} textValue={med.nombre}>
                                    {med.nombre} {med.concentracion ? `(${med.concentracion})` : ''}
                                </SelectItem>
                            ))}
                        </Select>
                    )}
                    {/* Error message might be handled by the component prop errorMessage */}
                    {/* {errors.medicamento && <p className="text-red-500 text-xs mt-1">{errors.medicamento.message}</p>} */}
                </div>

                {/* --- Section for Date and Time --- */}
                <Input
                    {...register('fechaHoraToma')} // 6. Use the CORRECT field name
                    label="Fecha y Hora de Toma *"
                    type="datetime-local"
                    labelPlacement="outside"
                    placeholder=" "
                    isInvalid={!!errors.fechaHoraToma} // 7. Use the CORRECT field name
                    errorMessage={errors.fechaHoraToma?.message} // 8. Use the CORRECT field name
                    suppressHydrationWarning
                    className="w-full mb-10"
                />

                {/* --- Section for Description --- */}
                <Input
                    {...register('descripcion')}
                    label="Descripción (Opcional)" // 9. Label updated to show optional
                    labelPlacement="outside"
                    placeholder="Ej: Tomado con el desayuno, síntoma presentado..."
                    isInvalid={!!errors.descripcion}
                    errorMessage={errors.descripcion?.message}
                    className="w-full mb-4"
                />

                {/* --- Section for Action Buttons --- */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
                     <Button
                        type="button"
                        variant="light" // Or "outline" depending on HeroUI
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        loading={isSubmitting} // Use loading prop
                        disabled={isSubmitting || loadingMeds}
                    >
                        Guardar Registro
                    </Button>
                </div>
            </form>
        </>
    );
};

export default AddHistorialForm;