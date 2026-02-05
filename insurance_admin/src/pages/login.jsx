import React from "react";
import auth from "../classes/Auth";
import Loader from "react-js-loader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
//import logoh from '../images/logov.png';
import { withRouter } from "../components/with_router";

class LoginPage extends React.Component{
    constructor(props) {
        super(props);
        
        this.state = { 
            username: '', 
            password: '',
            loading: false,
        };

        this.handleUserChange = this.handleUserChange.bind(this);
        this.handlePassChange = this.handlePassChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleUserChange(event) { 
        this.setState({username: event.target.value});
    }

    handlePassChange(event) { 
        this.setState({password: event.target.value});
    }
      
    handleSubmit(event) {
        alert('An essay was submitted: ' + this.state.username);
        event.preventDefault();
    }

    componentDidMount(){
        document.body.style.background = "#111827";
        document.body.style.overflowX = "hidden";
    }

    render(){
        const showLoader = this.state.loading ? <div className="custom-loader">
                <Loader type="spinner-default" bgColor={"#00bc4a"} color={"#00bc4a"} title={"Cargando"} size={200}/>
            </div> : <div></div>;
        return (
            <>
            {showLoader}
            <ToastContainer />
            <div className="bg-gray-900">
                <div className="flex flex-col items-center mt-[100px]">
                    <div className="w-1/1 lg:w-1/4 nunito-reg">
                        <form className="bg-gray-800 border-gray-700 shadow-md rounded px-8 pt-2 pb-8 mb-4">
                            <h1 className="mb-1 text-[2.5rem] text-center text-white mt-[30px] mb-[30px]">Iniciar Sesión</h1>
                            <div className="mb-4">
                                <label className="block text-white text-sm font-bold mb-2 text-[1.2rem]">
                                    Correo
                                </label>
                                <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" type="email" placeholder="Tu correo electrónico" onChange={this.handleUserChange}/>
                            </div>
                            <div className="mb-4">
                                <label className="block text-white text-sm font-bold mb-2 text-[1.2rem]">
                                    Contraseña
                                </label>
                                <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" type="password" placeholder="••••••••" onChange={this.handlePassChange}/>
                            </div>
                            <div className="flex items-center justify-between">
                      <div className="flex items-start">
                         {/*  <div className="flex items-center h-5">
                            <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required=""/>
                          </div>
                          <div className="ml-3 text-sm">
                            <label for="remember" className="text-gray-500 dark:text-gray-300">Recordarme</label>
                          </div> */}
                      </div>
                      <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Olvidé mi contraseña</a>
                  </div>
                            <button type="button" className="mt-[20px] w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={ async () => {
                            
                            this.setState({loading: true});
                            var value = await auth.validateLogin(this.state.username, this.state.password);
                            
                            if(value.response == 1){
                                Cookies.set('token', value.token, { secure: true , sameSite: 'strict' }); //Cambiar el secure a true en produccion
                                Cookies.set('userType', value.type, { secure: true , sameSite: 'strict' }); //Cambiar el secure a true en produccion
                                Cookies.set('userName', value.name, { secure: true , sameSite: 'strict' }); //Cambiar el secure a true en produccion
                                Cookies.set('userId', value.id, { secure: true , sameSite: 'strict' }); //Cambiar el secure a true en produccion
                                
                                auth.login(()=>{
                                    this.props.navigate('/dashboard');
                                });
                                this.setState({loading: false});
                            }else{
                                this.setState({loading: false});
                                toast.error(value.response, {
                                    theme: "colored"
                                });
                            }
                        }}>Iniciar Sesión</button>
                        </form>
                    </div>
                   {/*  <button type="button" className="mt-[20px] w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" onClick={ async () => {
                            this.props.navigate('/registrarse');
                        }}>Registrarse</button> */}
                </div>
                {/* <div className="flex flex-col items-center mt-[50px]">
                    <div className="nunito-reg">
                        <button type="button" className="shadow fondo-amarillo hover:bg-purple-400 focus:shadow-outline focus:outline-none texto-azul font-bold py-2 px-4 rounded ml-5 mr-5" onClick={ async () => {
                             this.props.navigate('/registro');
                        }}>Registrarse</button>

                        
                    </div>
                </div> */}
            </div>
            </>
        )
    }
}

export default withRouter(LoginPage);