import {
Navigate,
Route,
Routes,
useLocation}
 from 'react-router-dom'
import Header from './components/Header.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BuffetEditor from './pages/BuffetEditor.jsx'
import Cart from './pages/Cart.jsx'
import {
useApp}
 from './context/AppContext.jsx'
function Protected(
{
children}
)
{
const{
user}
=useApp(
)
;
return user?.loggedIn?children:<Navigate to="/login" replace/>}
export default function App(
)
{
const location=useLocation(
)
;
return <div className="min-h-full bg-neutral-900 text-white">{
location.pathname!=='/login'&&<Header/>}
<Routes><Route path="/" element={
<Navigate to="/dashboard" replace/>}
/><Route path="/login" element={
<Login/>}
/><Route path="/dashboard" element={
<Protected><Dashboard/></Protected>}
/><Route path="/buffet/edit" element={
<Protected><BuffetEditor/></Protected>}
/><Route path="/cart" element={
<Protected><Cart/></Protected>}
/><Route path="*" element={
<Navigate to="/dashboard" replace/>}
/></Routes></div>}
