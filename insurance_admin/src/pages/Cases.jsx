import { useEffect, useState } from "react";
import CasesList from "../components/CasesList";
import NavbarAdmin from "../components/NavbarAdmin";
import { Card } from "flowbite-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CasesPage() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [interpretation, setInterpretation] = useState(null);

    const fetchCases = async () => {
        try {
            const res = await fetch("http://localhost:3121/api/public/cases", { //API del sistema de la empresa
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });

            const json = await res.json();

            if (json?.response === 1 && Array.isArray(json.data)) {
                setCases(json.data);
            }
        } catch (err) {
            console.error("Error cargando casos:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInterpretation = async () => {
        try {
            const res = await fetch("http://localhost:3121/api/public/get-interpretation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})  // si no requiere parámetros, lo dejamos vacío
            });

            const json = await res.json();

            if (json?.response === 1) {
                setInterpretation(json.data);
            }
        } catch (err) {
            console.error("Error cargando interpretación:", err);
        }
    };

    useEffect(() => {
        fetchCases();
        fetchInterpretation();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl font-semibold">
                Cargando información...
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900 pb-[100px]'>
            <div className='grid grid-cols-1 p-4 xl:pl-[3%] xl:pr-[3%] pt-[10px] sm:ml-64'>
                <NavbarAdmin />

                {/* ESTADÍSTICAS ARRIBA - FULL WIDTH */}
                {interpretation && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 mb-10">

                        {/* TOTAL DE CASOS */}
                        <Card className="shadow-md hover:shadow-lg transition-all">
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                Total de Casos
                            </h2>
                            <p className="text-6xl font-extrabold text-blue-600 dark:text-blue-400 mt-4">
                                {interpretation.total}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Casos procesados por IA</p>
                        </Card>

                        {/* POR CATEGORÍA */}
                        <Card className="shadow-md hover:shadow-lg transition-all">
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Por Categoría
                            </h2>

                            <div className="space-y-2">
                                {Object.entries(interpretation.categorias).map(([cat, val]) => (
                                    <div key={cat} className="flex justify-between items-center">
                                        <span className="text-gray-700 dark:text-gray-300">{cat}</span>
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            {val}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* POR PRIORIDAD */}
                        <Card className="shadow-md hover:shadow-lg transition-all">
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Por Prioridad
                            </h2>

                            <div className="space-y-3">

                                {/* PRIORIDAD 1 */}
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                                        <span className="text-gray-700 dark:text-gray-300">Alta</span>
                                    </span>
                                    <span className="text-xl font-bold text-red-600">
                                        {interpretation.prioridades["1"]}
                                    </span>
                                </div>

                                {/* PRIORIDAD 2 */}
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-400"></span>
                                        <span className="text-gray-700 dark:text-gray-300">Media</span>
                                    </span>
                                    <span className="text-xl font-bold text-yellow-500">
                                        {interpretation.prioridades["2"]}
                                    </span>
                                </div>

                                {/* PRIORIDAD 3 */}
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2">
                                        <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                                        <span className="text-gray-700 dark:text-gray-300">Baja</span>
                                    </span>
                                    <span className="text-xl font-bold text-green-600">
                                        {interpretation.prioridades["3"]}
                                    </span>
                                </div>

                            </div>
                        </Card>
                    </div>
                )}


                {/*CUERPO PRINCIPAL: CASOS IZQUIERDA + RESUMEN DERECHA */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* LISTA DE CASOS - IZQUIERDA (ocupa 2/3 en pantallas grandes) */}
                    <div className="lg:col-span-2">
                        <Card className="max-w-full">
                            <h1 className="text-3xl font-bold mb-4">Casos Pendientes de Procesar</h1>
                        </Card>

                        <div className="p-6">
                            <CasesList cases={cases} />
                        </div>
                    </div>

                    {/* RESUMEN - DERECHA */}
                    {interpretation && (
                        <div className="lg:col-span-1">
                            <Card>
                                <h2 className="text-2xl font-semibold mb-4">Resumen de Interpretación</h2>

                                <div className="prose prose-sm uxl:prose-lg dark:prose-invert max-h-[600px] overflow-y-auto pr-2">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {interpretation.interpretacion}
                                    </ReactMarkdown>
                                </div>

                                <p className="mt-4 text-sm text-gray-500">
                                    Última actualización:{" "}
                                    {new Date(interpretation.created_at).toLocaleString("es-CR")}
                                </p>
                            </Card>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );

}
