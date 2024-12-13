import HomePage from '../pages/HomePage/HomePage'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage'
import ListCustomerPage from '../pages/ListCustomerPage/ListCustomerPage'
import DetailCustomer from '../pages/DetailCustomer/DetailCustomer'
import ListEmployeePage from '../pages/ListEmployeePage/ListEmployeePage'
import DetailEmployee from '../pages/DetailEmployee/DetailEmployee'
import ImportProduct from '../pages/ImportProductPage/ImportProduct'
import CreateImportProduct from '../pages/CreateImportProduct/CreateImportProduct'
import DetailImportProduct from '../pages/DetailImportProduct/DetailImportProduct'
import AdjustServicePage from '../pages/AdjustServicePage/AdjustServicePage';
import OrderProductPage from '../pages/OrderProductPage/OrderProductPage';
import TopbarComponent from '../components/TopbarComponent/TopbarComponent';
import ProductPage from '../pages/ProductPage/ProductPage';
import ServicePage from '../pages/ServicePage/ServicePage';
import AddServicePage from '../pages/AddServicePage/AddServicePage';
import AddProductPage from '../pages/AddProductPage/AddProductPage';
import AdjustProductPage from '../pages/AdjustProductPage/AdjustProductPage'; // Import AdjustProductPage
import SignIn from '../pages/SignIn/SignIn';
import SignUp from '../pages/SignUp/SignUp';  
import SignUpDetails from '../pages/SignUp/SignUp_next'; // Import SignUpDetails

const routes = [
    {
        path: 'list-customer',
        page: ListCustomerPage,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'customer-detail/1',
        page: DetailCustomer,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'list-employee',
        page: ListEmployeePage,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'employee-detail/1',
        page: DetailEmployee,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'list-import-product',
        page: ImportProduct,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'import-product-detail/1',
        page: DetailImportProduct,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'create-import-product',
        page: CreateImportProduct,
        isShowHeader: true,
        protected: true,
    },
    {
        path: '/dang-nhap',
        page: SignIn,
        isShowHeader: false,
        protected: false,
    },
    {
        path: '/dang-ky',
        page: SignUp,
        isShowHeader: false,
        protected: false,
    },
    {
        path: '/',
        page: HomePage,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'adjust-service/:id',
        page: AdjustServicePage,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'list-order-product',
        page: OrderProductPage,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'list-product',
        page: ProductPage,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'list-service',
        page: ServicePage,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'add-product',
        page: AddProductPage,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'adjust-product/:key', // Thêm route cho AdjustProductPage với tham số id
        page: AdjustProductPage,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'add-service',
        page: AddServicePage,
        isShowHeader: true,
        protected: true,
    },
    {
        path: 'top-bar',
        page: TopbarComponent,
    },
    {
        path: 'signup-details',
        page: SignUpDetails,
    },
    {
        path: '*',
        page: NotFoundPage,
    },
]

export default routes;