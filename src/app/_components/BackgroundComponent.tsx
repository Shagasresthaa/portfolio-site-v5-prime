export default function BackgroundComponent() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 flex items-stretch overflow-hidden">
      {/* Left side with telescope and laptop - hidden on mobile */}
      <div className="hidden flex-1 flex-col md:flex">
        {/* Telescope - top half */}
        <div className="flex-1 bg-[url('/assets/telescope.svg')] bg-contain bg-left bg-no-repeat" />

        {/* Laptop - bottom half with rotation */}
        <div className="flex-1 origin-center scale-[0.65] -rotate-[18deg] bg-[url('/assets/laptop.svg')] bg-contain bg-right bg-no-repeat" />
      </div>

      {/* Right side with astronaut - visible on all screens */}
      <div className="flex-1 bg-[url('/assets/astronaut.svg')] bg-contain bg-center bg-no-repeat" />
    </div>
  );
}