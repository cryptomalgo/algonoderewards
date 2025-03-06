export function Error() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-auto flex-col justify-center px-6 py-24 sm:py-64 lg:px-8">
      <h1 className="mt-4 text-5xl font-semibold tracking-tight text-pretty text-red-900 sm:text-6xl">
        Cannot load transactions
      </h1>
      <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
        Sorry, we couldn’t get your transactions. Please verify your address and
        try again later.
      </p>
      <div className="mt-10">
        <a href="/" className="text-sm/7 font-semibold text-indigo-600">
          <span aria-hidden="true">&larr;</span> Back to home
        </a>
      </div>
    </main>
  );
}
