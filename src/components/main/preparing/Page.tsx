// Local Imports
import { Spinner } from '../../ui/spinner';


const Page = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-18 h-18 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Spinner />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                We are preparing your account
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Please do not exit or refresh this page, you will be redirected when logged in.
            </p>
        </div>
    )
}

export default Page
