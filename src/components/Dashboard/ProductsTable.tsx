import React, { FC } from 'react';
import { Search } from 'lucide-react';

interface ProductsTableProps {
    searchTerm: string;
    handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filteredProducts: any[];
    formatCurrency: (amount: number) => string;
    stockStatus: (stock: number) => { text: string; class: string };
}

const ProductsTable: FC<ProductsTableProps> = ({
    searchTerm,
    handleSearch,
    filteredProducts,
    formatCurrency,
    stockStatus
}) => {
    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold text-purple-600">المنتجات</h2>
                <div className="relative w-64">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="بحث عن منتج..."
                        className="w-full pr-10 py-2 px-4 border rounded-lg focus:outline-none focus:border-purple-500"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </div>
            <div className="p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المنتج</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الفئة</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">السعر</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">المخزون</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {product.images && product.images.length > 0 && (
                                                <img 
                                                    src={product.images[0]} 
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-full object-cover ml-2"
                                                />
                                            )}
                                            <span className="font-medium text-gray-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{product.category}</td>
                                    <td className="px-6 py-4 text-gray-500">{formatCurrency(product.price)}</td>
                                    <td className="px-6 py-4 text-gray-500">{product.stock}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${stockStatus(product.stock).class}`}>
                                            {stockStatus(product.stock).text}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductsTable;