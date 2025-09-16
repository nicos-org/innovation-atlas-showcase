export const InnovationBanner = () => {
  return (
    <div className="w-full bg-gradient-primary shadow-soft">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-white rounded-full"></div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Innovations
            </h1>
          </div>
          <div className="flex-1 text-left">
            <p className="text-white/90 text-lg font-medium">
              Explore global innovation patterns and regulatory innovations worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};