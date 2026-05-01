"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Item {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number | null;
  status: string;
}

type Language = "en" | "es";

const translations = {
  en: {
    title: "Inventory & Profit Tracker",
    totalSpent: "Total Spent",
    totalEarned: "Total Earned",
    netProfit: "Net Profit",
    buyNewItem: "Buy New Item",
    itemName: "Item Name",
    buyPrice: "Buy Price ($)",
    addToInventory: "Add to Inventory",
    currentInventory: "Current Inventory",
    cost: "Cost",
    sellPrice: "Sell Price $",
    sell: "Sell",
    salesHistory: "Sales History",
    bought: "Bought",
    sold: "Sold",
    emptyInventory: "Inventory is empty.",
    emptyHistory: "No items sold yet.",
    invalidPriceError: "Please enter a valid selling price.",
    Clearitems: "Clear selling history",
  },
  es: {
    title: "Inventario y Ganancias obtenidas",
    totalSpent: "Gastos Totales",
    totalEarned: "Ganancias Totales",
    netProfit: "Beneficio Neto",
    buyNewItem: "Comprar un Nuevo Producto",
    itemName: "Nombre del Producto",
    buyPrice: "Precio de Compra ($)",
    addToInventory: "Añadir al Inventario",
    currentInventory: "Estado Actual del Inventario",
    cost: "Costo",
    sellPrice: "Precio de Venta $",
    sell: "Vender",
    salesHistory: "Historial de Ventas",
    bought: "Comprado",
    sold: "Vendido",
    emptyInventory: "El inventario está vacío.",
    emptyHistory: "Aún no se han vendido artículos.",
    invalidPriceError: "Por favor ingrese un precio de venta válido.",
    Clearitems: "Eliminar el historial de ventas",
  },
};

export default function InventoryClient({ items }: { items: Item[] }) {
  const router = useRouter();


  const [lang, setLang] = useState<Language>("en");
  const t = translations[lang];

  const [newItemName, setNewItemName] = useState("");
  const [newItemBuyPrice, setNewItemBuyPrice] = useState("");
  const [sellPrices, setSellPrices] = useState<{ [key: string]: string }>({});

  const totalSpent = items.reduce((sum, item) => sum + item.buyPrice, 0);
  const totalEarned = items.reduce((sum, item) => sum + (item.sellPrice || 0), 0);
  const netProfit = totalEarned - totalSpent;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemBuyPrice) return;

    await fetch("http://backend:8000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItemName,
        buyPrice: parseFloat(newItemBuyPrice),
      }),
    });
    
    setNewItemName("");
    setNewItemBuyPrice("");
    router.refresh();
  };

  const handleSellItem = async (id: string) => {
    const sellPrice = parseFloat(sellPrices[id]);
    if (isNaN(sellPrice)) {
      alert(t.invalidPriceError);
      return;
    }

    await fetch(`http://backend:8000/items/${id}/sell`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellPrice }),
    });

    router.refresh();
  };

  const handleClearHistory = async () => {
    if (!confirm(lang === "en" ? "Clear all sold items history?" : "¿Eliminar todo el historial de ventas?")) return;
    await fetch("http://backend:8000/items/sold", { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative pt-4">
      

      <div className="absolute top-0 right-0">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Language)}
          className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black cursor-pointer font-medium"
        >
          <option value="en">🇺🇸 English</option>
          <option value="es">🇪🇸 Español</option>
        </select>
      </div>

    
      <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm text-red-600 font-semibold">{t.totalSpent}</p>
            <p className="text-2xl font-bold text-red-700">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-sm text-green-600 font-semibold">{t.totalEarned}</p>
            <p className="text-2xl font-bold text-green-700">${totalEarned.toFixed(2)}</p>
          </div>
          <div className={`p-4 rounded-lg border ${netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
            <p className={`text-sm font-semibold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{t.netProfit}</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              ${netProfit.toFixed(2)}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
    
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">{t.buyNewItem}</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder={t.itemName}
              />
              <input
                type="number"
                step="0.01"
                value={newItemBuyPrice}
                onChange={(e) => setNewItemBuyPrice(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder={t.buyPrice}
              />
              <button type="submit" className="w-full bg-black text-white rounded-lg p-2 font-semibold hover:bg-gray-800">
                {t.addToInventory}
              </button>
            </form>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">{t.currentInventory}</h2>
            {items.filter(i => i.status === "IN_STOCK").length === 0 ? (
                <p className="text-gray-500 text-sm">{t.emptyInventory}</p>
            ) : (
              <ul className="space-y-3">
                {items.filter((item) => item.status === "IN_STOCK").map((item) => (
                  <li key={item.id} className="p-3 border rounded-lg flex flex-col space-y-2 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-red-600 text-sm">{t.cost}: ${item.buyPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder={t.sellPrice}
                        className="w-full border rounded p-1 text-sm"
                        value={sellPrices[item.id] || ""}
                        onChange={(e) => setSellPrices({ ...sellPrices, [item.id]: e.target.value })}
                      />
                      <button
                        onClick={() => handleSellItem(item.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        {t.sell}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

      
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t.salesHistory}</h2>
            {items.filter(i => i.status === "SOLD").length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
              >
                {t.Clearitems}
              </button>
            )}
          </div>
          {items.filter(i => i.status === "SOLD").length === 0 ? (
              <p className="text-gray-500 text-sm">{t.emptyHistory}</p>
            ) : (
            <ul className="space-y-3">
              {items.filter((item) => item.status === "SOLD").map((item) => {
                const profit = (item.sellPrice || 0) - item.buyPrice;
                return (
                  <li key={item.id} className="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {t.bought}: ${item.buyPrice.toFixed(2)} | {t.sold}: ${(item.sellPrice || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profit >= 0 ? '+' : '-'}${Math.abs(profit).toFixed(2)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

      </div>
    </div>
  );
}