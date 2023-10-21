import GlobalStyles from 'components/elements/Layouts/GlobalStyles'
import RootLayout from 'components/elements/Layouts/RootLayout'
import HomeRoute from 'components/routes/home.route'
import ProfileRoute from 'components/routes/profile.route'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '',
        element: <HomeRoute />,
      },
      {
        path: '/sign_in',
        element: <HomeRoute />,
      },
      {
        path: ':npub',
        element: <ProfileRoute />,
      },
    ],
  },
])

function App() {
  return (
    <>
      <GlobalStyles />
      <RouterProvider router={router} />
    </>
  )
}

export default App
