export default function CustomersPage() {
  const customers = [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Customers
        </h1>

        <button className="bg-black text-white px-4 py-2 rounded-xl">
          + Add Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        {customers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No customers found
          </div>
        ) : (
          <div>Customer List</div>
        )}
      </div>
    </div>
  );
}