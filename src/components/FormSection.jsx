
const FormSection = ({ title, icon, children, noGrid }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
            {icon}
            {title}
        </h3>
        <div className={noGrid ? undefined : "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"}>
            {children}
        </div>
    </div>
);

export default FormSection;