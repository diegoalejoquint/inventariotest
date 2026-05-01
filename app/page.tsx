// app/page.tsx
import InventoryClient from "./InventoryClient";

export default async function Home() {
  // Fetch data from FastAPI backend
  const res = await fetch("http://127.0.0.1:8000/items", { 
    cache: "no-store" // Ensures it always gets fresh data
  });
  
  const items = await res.json();

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <InventoryClient items={items} />
    </main>
  );
}