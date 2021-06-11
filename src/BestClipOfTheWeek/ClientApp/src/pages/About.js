import React from 'react'

export function About() {
  return (
    <>
      <div>
        <h1 id="title">About</h1>
        <h2>
          <a href="https://github.com/Reptarsrage/bestClipOfTheWeek">Best Clip of the Week</a>
        </h2>
        <h3>An ASP.NET Core Web App</h3>
        <p>
          <a href="https://codecov.io/gh/Reptarsrage/bestClipOfTheWeek">
            <img
              src="https://codecov.io/gh/Reptarsrage/bestClipOfTheWeek/branch/master/graph/badge.svg"
              alt="Code Coverage status"
            />
          </a>
          <a href="https://ci.appveyor.com/project/Reptarsrage/bestclipoftheweek">
            <img
              src="https://ci.appveyor.com/api/projects/status/4ntsr4sl2vey3krf/branch/master?svg=true"
              alt="Build status"
            />
          </a>
        </p>

        <h2 id="description">Description</h2>
        <p>This is my attempt to tally the votes for StoneMountain64's Best Clip of the Week video series.</p>
        <p>
          This site is not meant for a wide range of users. Mostly just one, although now that I've made it I possibly
          see a little room for growth. My intention was to have a program that took a YouTube URL and a list of terms
          and returned a count of votes for each term by sifting through the video comments. After I completed this I
          thought, 'wouldn't it be cool if I could play with the terms, store them and manipulate them?' Well this whim
          lead to a backend server and a service running on Azure. Then I thought, wouldn't it be cool if I had some
          charts? Turns out there are a ton of free, cool charting libraries. Then I figured since I have a database
          that may or may not charge me money for heavy use, I need some security. This drove me to implement a login
          system.
        </p>
        <p>
          After all that was said and done, I had kind of this clunky, but cool looking website (thanks bootstrap).
          There are a couple of things that I haven't gotten to yet. The biggest one is improving the client-side code
          structure. I have far more experience with server-side coding and I rely heavily on public libraries like
          bootstrap and react to do front end work. There is also the issue with errors cropping up. I didn't write many
          unit tests as this was just kind of an ad-hoc fun project and I didn't want to deal with the overhead. There
          are some heavy restrictions on my back-end server size, the amount of API calls I can make, and a few other
          limiting factors. There are some errors with showing/hiding loading and error messages that still need to be
          worked out. There are many moving client-side pieces here, and if one fails the site doesn't work, it would be
          nice to come up with a solution for this as well.
        </p>
        <p>I had a super fun time making this site. Flaws and all I think it turned out well.</p>

        <h2 id="credits">Credits</h2>
        <ul>
          <li>
            API's
            <ul>
              <li>
                <a href="https://developers.google.com/youtube/analytics/">YouTube Analytics and Reporting APIs</a>{' '}
                fetches YouTube stats, and much more.
              </li>
              <li>
                <a href="https://developers.google.com/youtube/v3/">YouTube Data API</a> parses YouTube comments, and
                much much more.
              </li>
              <li>
                <a href="https://developers.google.com/+/api/">Google+ Data API</a> parses Google+ comments, and much
                much much more.
              </li>
            </ul>
          </li>
          <li>
            Images
            <ul>
              <li>
                <a href="https://fontawesome.com/">Font Awesome</a> for all them cool icons.
              </li>
              <li>
                <a href="https://www.youtube.com/user/StoneMountain64">StoneMountain64</a> for use of his logo.
              </li>
            </ul>
          </li>

          <li>
            Development
            <ul>
              <li>
                <a href="https://jquery.com/">Jquery</a> library quite a revolutionary and free library.
              </li>
              <li>
                <a href="https://reactjs.org/">React</a> it was either this or Vue.
              </li>
              <li>
                <a href="http://recharts.org/en-US/">Recharts</a> for all your well-documented React charting needs.
              </li>
              <li>
                <a href="https://getbootstrap.com/">Bootstrap</a> made it so I didn't have to program ~~any~~ much CSS.
              </li>
              <li>
                <a href="https://bootswatch.com/">Bootswatch</a> because bootstrap was too boring after a while.
              </li>
              <li>
                <a href="https://github.com/kirillDanshin/halogenium">Halogenium </a> a BALLER loading icon library.
              </li>
              <li>
                <a href="https://github.com/casesandberg/react-color">React Color</a> a SICK color chooser.
              </li>
              <li>
                <a href="https://github.com/AaronCCWong/react-card-flip">ReactCardFlip</a> a FABULOUS card flip element.
              </li>
              <li>
                <a href="https://github.com/exupero/saveSvgAsPng">saveSvgAsPng</a> a SICK color chooser.
              </li>
            </ul>
          </li>

          <li>
            Special Thanks
            <ul>
              <li>
                <a href="https://www.openshift.com/">OpenShift</a> for hosting my SQL server and old PHP service for a
                while.
              </li>
              <li>
                <a href="https://x10hosting.com/">x10hosting.com</a> for hosting my site for free for a while.
              </li>
              <li>
                <a href="https://azure.microsoft.com/">Microsoft Azure</a> for hosting my site currently.
              </li>
              <li>
                <a href="http://nnattawat.github.io/flip/">nnattawat</a> for my old flip animation.
              </li>
              <li>
                <a href="http://jscolor.com/">JSColor</a> for my old color chooser.
              </li>
              <li>
                <a href="http://cssmenumaker.com/menu/responsive-menu-bar">CSS Menu Maker</a> for my stupidly classy old
                header bar.
              </li>
              <li>
                <a href="http://www.w3schools.com/">W3Scools</a> - my sensei.
              </li>
              <li>
                <a href="http://phpfiddle.org/">phpfiddle</a> for an easy solution to php programming.
              </li>
              <li>
                <a href="https://www.youtube.com/channel/UCN-v-Xn9S7oYk0X2v1jx1Qg">StoneMountain64</a> for kickin' shit
                and eatin' snakes.
              </li>
            </ul>
          </li>
        </ul>

        <h2 id="todo">TODO</h2>
        <h3>Goals</h3>
        <ul>
          <li>[x] Drop PHP/MySql service layer and use Entity Framework &amp; SQL Server</li>
          <li>[x] Migrate site to Net Core 2.0</li>
          <li>[x] Update site to SSL</li>
          <li>[x] Add Application Insights</li>
          <li>[x] Migrate site to Net Core 2.1</li>
          <li>
            [x] Switch to new{' '}
            <a href="https://docs.microsoft.com/en-us/aspnet/core/security/authentication/scaffold-identity">
              Razor Page Identity Scaffolding
            </a>
          </li>
          <li>[x] Switch to a front end framework such as React</li>
          <li>[x] Add (at least one) unit tests</li>
          <li>[x] Add User Secrets for local development</li>
          <li>[x] Set up a continuous deployment pipeline (Appveyor/Github/CodeCov)</li>
          <li>[x] Privacy Statement and GDPR compliance</li>
          <li>[x] Use AutoMapper for server-side model conversion</li>
          <li>[ ] Fix client-side error handeling</li>
          <li>[ ] Add site logging</li>
          <li>[ ] Add Integration tests</li>
          <li>[ ] Add fancier animations</li>
        </ul>

        <h3>Stretch Goals</h3>
        <ul>
          <li>
            [ ] <a href="https://schema.org/">SEO</a>
          </li>
          <li>
            [ ]{' '}
            <a href="https://docs.microsoft.com/en-us/dotnet/standard/globalization-localization/">
              Globalization and Localization
            </a>
          </li>
          <li>
            [ ] <a href="https://www.w3.org/WAI/standards-guidelines/aria/">Accessibility</a>
          </li>
        </ul>

        <h2 id="support">Support</h2>
        <p>
          Feel free to contact me directly with any questions or concerns related to the site. I'm definitely open to
          criticism, ideas, suggestions and even more open to praise.
        </p>
        <p>
          <a href="mailto:justinprobb@gmail.com">Contact me</a>
        </p>
      </div>
    </>
  )
}
