export function Hero() {
  return (
    <header
      className="
        relative
        h-40
        w-full
        overflow-hidden
        border-b
        border-zinc-800/20
      "
    >
      {/* BACKGROUND */}
      <div
        className="
          absolute inset-0
          bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f')]
          bg-cover
          bg-center
        "
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60" />

      {/* CONTENT */}
      <div className="relative z-10 flex h-full items-center px-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Mi Librería
          </h1>

          <p className="mt-2 text-sm text-zinc-200">
            Control de catálogo, búsqueda y ventas
          </p>
        </div>
      </div>
    </header>
  );
}