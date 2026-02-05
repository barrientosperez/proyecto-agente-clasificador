import Cookies from 'js-cookie';

class Auth {
    constructor(){
        this.authenticated = 0;
    }

    login(cb){
        Cookies.set('logged', '1', { secure: false , sameSite: 'strict' });
        cb();
    }

    logout(cb){
        Cookies.remove('logged');
        cb();
    }

    isAuthenticated(){
        if(Cookies.get('logged') == 1){
            return true;
        }else{
            return false;
        }
    }

    async validateLogin(user, pass) {
        var data = {email: user, password: pass};
        var requestData = await fetch(import.meta.env.VITE_BASE_API_URL+'users/login', {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json'
            }
        });

        var response = requestData.json();
        
        return response;
    }
}

export default new Auth()