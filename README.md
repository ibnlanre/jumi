# UPDATE VARIABLES

You can update the --text-color and --background-color custom properties by doing the following:

var bodyStyles = document.body.style;
bodyStyles.setProperty('--text-color', 'white');
bodyStyles.setProperty('--background-color', 'black');

<p class="colored" style="--mycolor:red;">Lorem ipsum</p>
<p class="shadowed" style="--shadowcolor:green;">dolor sit amet</p>

// there can only be one transform property

// animation: -name -duration -timing-function -delay -direction -iteration-count -fill-mode -play-state

// translate, rotate, scale;
// height, width, border;

<!-- https://stackoverflow.com/questions/52005083/how-to-define-css-variables-in-style-attribute-in-react-and-typescript -->