import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-primary-600 tracking-tight sm:text-7xl lg:text-8xl">
          404
        </h1>
        <p className="mt-4 text-xl font-medium text-gray-900">
          Page not found
        </p>
        <p className="mt-2 text-base text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="btn-primary inline-flex items-center"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound