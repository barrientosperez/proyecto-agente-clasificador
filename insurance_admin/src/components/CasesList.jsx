import { useState } from "react";
import { Tabs } from "flowbite-react";

export default function CasesList({ cases }) {

    const categorias = [...new Set(cases.map(item => item.categoria))];
    const [selectedTab, setSelectedTab] = useState(categorias[0]);

    const filteredCases = cases.filter(item => item.categoria === selectedTab);

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString("es-CR", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    return (
        <div>
            {/* TABS DINÁMICOS SIN ERRORES */}
            <Tabs
                aria-label="Tabs categorías"
                onActiveTabChange={(tabIndex) => setSelectedTab(categorias[tabIndex])}
            >
                {categorias.map((cat, index) => (
                    <Tabs.Item key={index} title={cat}></Tabs.Item>
                ))}
            </Tabs>

            {/* LISTA TIPO MÓVIL */}
            <div className="mt-1 space-y-4">
                {filteredCases.map(item => (
                    <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">{item.nombre}</h2>
                            <span className="text-sm text-gray-500">{formatDate(item.fecha)}</span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                            <strong>Monto: </strong> ₡ {Number(item.monto).toLocaleString()}
                        </p>

                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                            <strong>Nacionalidad: </strong> {item.nacionalidad}
                        </p>

                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            <strong>Motivo: </strong> {item.motivo}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
