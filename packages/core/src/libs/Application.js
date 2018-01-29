import { Application as MakeenApplication } from 'makeen';
import expressReactViews from 'express-react-views';

class Application extends MakeenApplication {
  constructor(...args) {
    super(...args);

    this.set('views', `${__dirname}/../views`);
    this.set('view engine', 'js');
    this.engine('jsx', expressReactViews.createEngine());
  }
}

export default Application;
