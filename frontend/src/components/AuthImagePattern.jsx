const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="items-center justify-center hidden p-12 lg:flex bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-white/20 backdrop-blur-sm ${
                i % 2 === 0 ? "animate-pulse" : ""
              }`}
            />
          ))}
        </div>
        <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
        <p className="text-blue-100">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;