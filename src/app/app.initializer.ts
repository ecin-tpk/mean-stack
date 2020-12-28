import {environment} from '../environments/environment';

declare const FB: any;

export function appInitializer() {
  return () =>
    new Promise((resolve) => {
      // Wait for facebook sdk to initialize before starting the angular app
      window['fbAsyncInit'] = () => {
        FB.init({
          appId: environment.facebookAppId,
          cookie: true,
          xfbml: true,
          version: 'v8.0',
        });

        // // auto authenticate with the api if already logged in with facebook
        // FB.getLoginStatus(({ authResponse }) => {
        //   if (authResponse) {
        //     accountService
        //       .apiAuthenticate(authResponse.accessToken)
        //       .subscribe()
        //       .add(resolve);
        //   } else {
        //     resolve();
        //   }
        // });
        resolve();
      };

      // load facebook sdk script
      ((d, s, id) => {
        let js;
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
      })(document, 'script', 'facebook-jssdk');
    });
}
