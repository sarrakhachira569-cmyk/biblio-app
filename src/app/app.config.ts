import { ApplicationConfig } from '@angular/core';
import { InMemoryScrollingFeature, provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

const scrolling: InMemoryScrollingFeature = withInMemoryScrolling({ scrollPositionRestoration: 'top' });

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, scrolling)]
};
