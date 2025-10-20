export default function AssetCard({ asset }) {
    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <img
                src={asset.previewUrl}
                alt={asset.name}
                className="w-full h-32 object-cover"
            />
            <div className="p-3">
                <h3 className="font-medium text-sm">{asset.name}</h3>
                <p className="text-xs text-gray-500">{asset.category} • {asset.subCategory}</p>
            </div>
        </div>
    );
}
