// This shader demonstrates how to move shapes 

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float colorAr;
uniform float colorAg;
uniform float colorAb;
uniform float colorBr;
uniform float colorBg;
uniform float colorBb;
uniform float colorCr;
uniform float colorCg;
uniform float colorCb;
uniform float tileChoice;

uniform float rad;
uniform vec2 offset;
// uniform float radB;
// uniform vec2 offsetB;
// uniform float radC;
// uniform vec2 offsetC;
// uniform float radD;
// uniform vec2 offsetD;

#define sm = 1.0;
#define S smoothstep
#define CG colorGradient
#define PI 3.14159

// Define choosen colors
#define colA vec3(colorAr, colorAg, colorAb)/255.
#define colB vec3(colorBr, colorBg, colorBb)/255.
#define colC vec3(colorCr, colorCg, colorCb)/255.

// Grid Colors
#define RED vec3(255,0,0)/255.

// Tile colors

#define GREEN vec3(83,255,69)/255.
#define LAVENDER vec3(163,147,191)/255.
#define ROSE vec3(244,91,105)/255.
#define ORANGE vec3(255,82,27)/255.
#define YELLOW vec3(255,177,0)/255.
#define GREY vec3(89,89,89)/255.
#define BLUE vec3(30,46,222)/255.


// Coding Train colors
#define PURPLE vec3(63,46,86)/255.
#define MAUVE vec3(187,182,223)/255.
#define LTPURPLE vec3(198,200,238)/255.
#define RASPBERRY vec3(222,13,146)/255.

vec3 colorGradient(vec2 uv, vec3 col1, vec3 col2, float m) {
  float k = uv.y*m + m;
  vec3 col = mix(col1, col2, k);
  return col;
}  

// Rotation matrix
mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

// Copied from Inigo Quilez
float sdSegment( vec2 uv, vec2 a, vec2 b) {
  vec2 pa = uv-a, ba = b-a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa-ba*h );
}

float sdCircle( vec2 uv, float r) {
  return length(uv) - r;
} 

//From Inigo Quilez
float sdBox( vec2 uv, vec2 b )
{
    vec2 d = abs(uv)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

// From Inigo Quilez
float sdRoundedBox( vec2 uv, vec2 b, vec4 r) {
  r.xy = (uv.x>0.0) ? r.xy : r.zw;
  r.x = (uv.y>0.0) ? r.x : r.y;
  vec2 q = abs(uv) - b + r.x;
  return min( max(q.x, q.y), 0.0) + length(max(q, 0.0) ) - r.x;
}

float Arc( vec2 uv, float r1, float r2) {
  return abs(sdCircle(uv, r1)) - r2;
}

// Function to check for symmetry of design
vec3 checkSymmetry( vec2 uv ) {
    float d1 = sdSegment(uv, vec2(-.5, .0), vec2(0.5, .0));
    float l1 = S(.008, .0, d1); // horizontal center line
    float d2 = sdSegment(uv, vec2(-.5, -.25), vec2(0.5, -.25));
    float l2 = S(.008, .0, d2); // horizontal line
    float d3 = sdSegment(uv, vec2(-.5, .25), vec2(0.5, .25));
    float l3 = S(.008, .0, d3); // horizontal line
    float d4 = sdSegment(uv, vec2(-.5, -.125), vec2(0.5, -.125));
    float l4 = S(.008, .0, d4); // horizontal line
    float d5 = sdSegment(uv, vec2(-.5, .125), vec2(0.5, .125));
    float l5 = S(.008, .0, d5); // horizontal line
    float d6 = sdSegment(uv, vec2(-.5, -.0625), vec2(0.5, -.0625));
    float l6 = S(.008, .0, d6); // horizontal line
    float d7 = sdSegment(uv, vec2(-.5, .0625), vec2(0.5, .0625));
    float l7 = S(.008, .0, d7); // horizontal line  
    float d8 = sdSegment(uv, vec2(-.5, -.1875), vec2(0.5, -.1875));
    float l8 = S(.008, .0, d8); // horizontal line
    float d9 = sdSegment(uv, vec2(-.5, .1875), vec2(0.5, .1875));
    float l9 = S(.008, .0, d9); // horizontal line  
    float d10 = sdSegment(uv, vec2(-.5, -.3125), vec2(0.5, -.3125));
    float l10 = S(.008, .0, d10); // horizontal line
    float d11 = sdSegment(uv, vec2(-.5, .3125), vec2(0.5, .3125));
    float l11 = S(.008, .0, d11); // horizontal line  
    float d12 = sdSegment(uv, vec2(-.5, -.375), vec2(0.5, -.375));
    float l12 = S(.008, .0, d12); // horizontal line
    float d13 = sdSegment(uv, vec2(-.5, .375), vec2(0.5, .375));
    float l13 = S(.008, .0, d13); // horizontal line  
    float d14 = sdSegment(uv, vec2(-.5, -.4375), vec2(0.5, -.4375));
    float l14 = S(.008, .0, d14); // horizontal line
    float d15 = sdSegment(uv, vec2(-.5, .4375), vec2(0.5, .4375));
    float l15 = S(.008, .0, d15); // horizontal line  
    vec3 l = (l1 + l2 + l3) * RED  + ( l4 + l5 + l6 + l7 + l8 + l9 
          + l10 + l11 + l12 + l13 + l14 + l15) * YELLOW;
    // vertical lines
    float d16 = sdSegment(uv, vec2(0.0, -0.5), vec2(0.0, 0.5));
    float v16 = S(.008, .0, d16); // vertical center line
    float d17 = sdSegment(uv, vec2(0.25, 0.5), vec2(.25, -0.5));
    float v17 = S(.008, .0, d17); // vertical  line
    float d18 = sdSegment(uv, vec2(-0.25, 0.5), vec2(-0.25, -0.5));
    float v18 = S(.008, .0, d18); // vertical  line
    float d20 = sdSegment(uv, vec2(0.125, -.5), vec2(0.125, .5));
    float v20 = S(.008, .0, d20); // vertical line
    float d21 = sdSegment(uv, vec2(-0.125, .5), vec2(-0.125, -.5));
    float v21 = S(.008, .0, d21); // vertical  line
    float d22 = sdSegment(uv, vec2(0.0625, -.5), vec2(0.0625, .5));
    float v22 = S(.008, .0, d22); // vertical line
    float d23 = sdSegment(uv, vec2(-0.0625, .5), vec2(-0.0625, -.5));
    float v23 = S(.008, .0, d23); // vertical  line
    float d24 = sdSegment(uv, vec2(.1875, .5), vec2(.1875, -.5));
    float v24 = S(.008, .0, d24); // vertical  line
    float d25 = sdSegment(uv, vec2(-0.1875, -.5), vec2(-0.1875, .5));
    float v25 = S(.008, .0, d25); // vertical line
    float d26 = sdSegment(uv, vec2(.3125, .5), vec2(.3125, -.5));
    float v26 = S(.008, .0, d26); // vertical  line
    float d27 = sdSegment(uv, vec2(.375, .5), vec2(.375, -.5));
    float v27 = S(.008, .0, d27); // vertical  line
    float d28 = sdSegment(uv, vec2(-0.375, -.5), vec2(-0.375, .5));
    float v28 = S(.008, .0, d28); // vertical line
    float d29 = sdSegment(uv, vec2(-.3125, .5), vec2(-.3125, -.5));
    float v29 = S(.008, .0, d29); // vertical  line
    float d30 = sdSegment(uv, vec2(.4375, .5), vec2(.4375, -.5));
    float v30 = S(.008, .0, d30); // vertical  line
    float d31 = sdSegment(uv, vec2(-.4375, .5), vec2(-.4375, -.5));
    float v31 = S(.008, .0, d31); // vertical  line
    vec3 v = (v16 + v17 + v18) * RED + ( v20 + v21 + v22
     + v23 + v24 + v25 + v26 + v27 + v28 + v29 + v30 + v31) * YELLOW;
    return l + v;
}

float circle(vec2 uv, vec2 os, float r ) {
  
  float s1 = sdCircle( uv - os, r );
  float m1 = S(0.008, 0.0, s1);
  
  
  // if (b == 1.0) {
  //   return m;
  // } else if (b == 0.0) {
  //   return s;
  // }
  return m1 ;
}

float circle2(vec2 uv, vec2 os, float r ) {
  float s1 = sdCircle( uv - 0.2*os, 0.5*r );
  float m1 = S(0.008, 0.0, s1);
  // if (b == 1.0) {
  //   return m;
  // } else if (b == 0.0) {
  //   return s;
  // }
  return m1 ;
}

float smCircleSquare( vec2 uv ) {
  float s1 = sdCircle( uv - vec2(0.25, 0.0), 0.25 );
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdBox( uv - vec2(0.5, 0.0), vec2(0.25, 0.25) );
  float m2 = S(0.008, 0.0, s2);
  return m1 + m2;
}

float lrCircleSquare( vec2 uv ) {
  float s1 = sdCircle( uv, 0.25 );
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdBox( uv - vec2(0.25, 0.0), vec2(0.25, 0.25) );
  float m2 = S(0.008, 0.0, s2);
  return m1 + m2;
}

float smallCorner( vec2 uv) {
  float s1 = sdRoundedBox( uv - vec2(0.25, 0.25), vec2(0.25, 0.25), vec4(0.0, 0.0, 0.0, 0.25) );
  float m1 = S(0.008, 0.0, s1);
  return m1;
}

float bigCorner( vec2 uv) {
  float s1 = sdRoundedBox( uv - vec2(0.25, 0.25), vec2(0.5, 0.5), vec4(0.0, 0.0, 0.0, 0.25) );
  float m1 = S(0.008, 0.0, s1);
  return m1;
}

float biggerCorner( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, .5), 1.);
  float m1 = S(0.008, 0.0, s1);
  return m1;
} 

float circleCorner( vec2 uv) {
 float s1 = sdCircle( uv - vec2(0.5, 0.5), 0.75);
 float m1 = S(0.008, 0.0, s1);
 return m1;
}

float quarterCircle( vec2 uv) {
 vec2 st = vec2(uv.x, -uv.y);
  float s1 = sdCircle(Rot(PI*0./4.)*uv- vec2(0.5, -0.5), 0.5);
  float m1 = S(0.008, 0.0, s1);
  return 1. - m1;
}

float quarterCircles( vec2 uv) {
 vec2 st = vec2(uv.x, -uv.y);
  float s1 = sdCircle(Rot(PI*0./4.)*uv- vec2(0.5, -0.5), 0.5);
  float m1 = S(0.008, 0.0, s1);
   float s2 = sdCircle(Rot(PI*0./4.)*uv- vec2(-0.5, 0.5), 0.5);
  float m2 = S(0.008, 0.0, s2);
  return 1. - m1 - m2;
}

float halfCircle( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, 0.0), 0.5);
  float m1 = S(0.008, 0.0, s1);
  return m1;
} 

float smallHalfCircle( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, 0.25), 0.25);
  float m1 = S(0.008, 0.0, s1);
  return m1;
} 

float smallerHalfCircle( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, 0.375), 0.125);
  float m1 = S(0.008, 0.0, s1);
  return m1;
} 

float slice( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, 1.5), 1.25);
  float m1 = S(0.008, 0.0, s1);
  return m1;
} 

float slices( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, 1.5), 1.25);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle( uv - vec2(-0.5, -1.5), 1.25);
  float m2 = S(0.008, 0.0, s2);
  return m1 + m2;
} 
float offsetCircle( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, 1.25), 1.25);
  float m1 = S(0.008, 0.0, s1);
  return  m1;
} 

// float centerSwirl( vec2 uv) {
//   vec2 st = vec2(uv.x, -uv.y);
//   float s1 = sdCircle( Rot(PI*0./13.25)*st - vec2(0.5, 0.0), 0.5);
//   float m1 = S(0.008, 0.0, s1);
//   float s2 = sdCircle( Rot(-PI*1./6.)*st - vec2(0.0, 0.5), 0.5);
//   float m2 = S(0.008, 0.0, s2);
//   float mm = m2 - min(m1,m2);
//   return m1 - min(m1,m2);
// } 
float bigArc( vec2 uv) {
  float s1 = sdCircle( uv - vec2(-0.5, -0.5), 1.0);
   float m1 = S(0.008, 0.0, s1);
   return m1;
}

float quarterDonut( vec2 uv) {
  float s1 = sdCircle(Rot(PI*0./4.)*uv- vec2(0.5, -0.5), 1.0);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle(Rot(PI*0./4.)*uv- vec2(0.5, -0.5), 0.5);
  float m2 = S(0.008, 0.0, s2);
 
  return m1 - m2 ;
} 
float centerSwirl2( vec2 uv) {
  float s1 = sdCircle( Rot(PI*0./13.25)*uv - vec2(0.5, 0.), 0.5);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle( Rot(-PI*1./3.)*uv - vec2(0.0, 0.5), 0.5);
  float m2 = S(0.008, 0.0, s2);
  float mm = m2 - min(m1,m2);
  return m1 - min(m1,m2);
} 
float swirl( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, 0.5), 1.0);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle( uv - vec2(0.375, 0.375), 0.625);
  float m2 = S(0.008, 0.0, s2);
  return m1 - m2;
} 

float swirlCircle( vec2 uv) {
  vec2 st = vec2(uv.x, -uv.y);
  float s1 = sdCircle( uv - vec2(-0.5, -0.5), 1.0);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle( Rot(PI*1./7.5)*uv - vec2(-0.775, -0.775), 1.025);
  float m2 = S(0.008, 0.0, s2);
  float s3 = sdCircle( uv - vec2(-0.25, -0.5), 0.25);
  float m3 = S(0.008, 0.0, s3);
  return m1 - m2 + m3;
  //return m3;
}

float swirl2( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, 0.5), 1.0);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle( uv - vec2(0.28, 0.48), 0.53);
  float m2 = S(0.008, 0.0, s2);
  return m1 - m2;
}  

float swirl3( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, 1.0), 1.25);
  float m1 = S(0.008, 0.0, s1);
  return 1. - m1;
  //return m1;
} 

// float swirl4( vec2 uv) {
//   float s1 = sdCircle( uv - vec2(-0.5, -0.5), 1.0);
//   float m1 = S(0.008, 0.0, s1);
//   float s2 = sdCircle( Rot(PI*1./7.5)*uv - vec2(-0.775, -0.775), 1.025);
//   float m2 = S(0.008, 0.0, s2);
//   return m1 - m2;
// } 

float swirl4( vec2 uv) {
  vec2 st = vec2(uv.x, -uv.y);
  float s1 = sdCircle( uv - vec2(-0.5, -0.5), 1.0);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle( Rot(PI*1./7.5)*uv - vec2(-0.775, -0.775), 1.025);
  float m2 = S(0.008, 0.0, s2);
  return m1 - m2;
} 
float swirl5( vec2 uv ) {
  float s1 = sdCircle( Rot(PI*1./128.)*uv - vec2(0.475, 0.75), .75);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle( Rot(PI*1./7.)*uv - vec2(0.525, 0.535), .525);
  float m2 = S(0.008, 0.0, s2);
  return 1. - (m1 - m2);
} 

float doubleSwirl( vec2 uv ) {
  float s1 = sdCircle( Rot(PI*1./128.)*uv - vec2(0.475, 0.75), .75);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle( Rot(PI*1./7.)*uv - vec2(0.525, 0.535), .525);
  float m2 = S(0.008, 0.0, s2);
  float s3 = sdCircle( Rot(PI*1./128.)*uv - vec2(-0.475, -0.75), .75);
  float m3 = S(0.008, 0.0, s3);
  float s4 = sdCircle( Rot(PI*1./7.)*uv - vec2(-0.525, -0.535), .525);
  float m4 = S(0.008, 0.0, s4);
  return 1. - (m1 - m2) - (m3 - m4);
} 

// float doubleSwirl2( vec2 uv ) {
//   vec2 st = vec2(uv.x, -uv.y);
//   // float s1 = sdCircle( Rot(PI*1./128.)*st - vec2(0.475, 0.75), .75);
//   // float m1 = S(0.008, 0.0, s1);
//   // float s2 = sdCircle( Rot(PI*1./7.)*st - vec2(0.525, 0.535), .525);
//   // float m2 = S(0.008, 0.0, s2);
//   // float s = swirl5(Rot(-PI*1./5.0)*st - vec2(-0.15,0.3));
//   // float s1 = swirl5(Rot(-PI*1./5.0)*st - vec2(0.15,-0.3));
//   // return s;//+ s1;
//   //return 1. - (m1 - m2) ;//- (m3 - m4);
// } 



float anotherSwirl( vec2 uv ) {
  float s1 = sdCircle( Rot(PI*0./128.)*uv - vec2(-0.5, 0.5), .25);
  float m1 = S(0.008, 0.0, s1);
  float mm = 1. - m1;
  float s2 = sdCircle( Rot(PI*1./20.)*uv - vec2(-0.15, .405), .475);
  float m2 = S(0.008, 0.0, s2);
  // float s3 = sdCircle( Rot(PI*1./128.)*uv - vec2(-0.475, -0.75), .75);
  // float m3 = S(0.008, 0.0, s3);
  // float s4 = sdCircle( Rot(PI*1./7.)*uv - vec2(-0.525, -0.535), .525);
  // float m4 = S(0.008, 0.0, s4);
  return m2 - m1;// (m3 - m4);
} 

float curve( vec2 uv ) {
  float s1 = sdCircle( Rot(PI*0./128.)*uv - vec2(0.475, -0.75), .75);
  float m1 = S(0.008, 0.0, s1);
  return m1;
}



   // half circle on edge
 float btHalfCircle( vec2 uv) {
    float s = sdCircle(uv - vec2(0.0, -0.5), 0.25);
    float m = S(.008, 0., s);
    return m;
   }
 


// Choose shape
vec3 chooseShape( float shapechoice, vec2 uv, vec3 col1, vec3 col2, vec3 col3 ) {
  vec3 col = vec3(0.0);
  if (shapechoice == 0.0) {
    float c1 = circle( uv, offset, rad );
    float c2 = circle( uv, (1.-0.75) *  offset, 0.7 * rad );
  // col += (1. - c2) * col1 + c2 * col2;

   col += (1. - c1 - c2) * col1 + c1 * col2 +  c2 * col3;
  }
  else if (shapechoice == 1.0) {
    float cb1 = circle( uv, offset, rad );
    float cb2 = circle( uv, (1.-0.75) *  offset, 0.7 * rad );
    col += (1. - cb1 - cb2) * col1 + cb1 * col2 +  cb2 * col3;
  }
 else if (shapechoice == 2.0) {
   float cc1 = circle( uv, offset, rad );
   float cc2 = circle( uv, (1.-0.75) * offset, 0.7 * rad );
    col += (1. - cc1 - cc2) * col1 + cc1 * col2 + cc2 * col3;
  }
  else if (shapechoice == 3.0) {
    float cd1 = circle( uv, offset, rad );
    float cd2 = circle( uv, (1.-0.75) * offset, 0.7 * rad );
    col += (1. - cd1- cd2) * col1 + cd1 * col2 + cd2*col3;
  }
  //  else if (shapechoice == 2.0) {
  //   float ds = doubleSwirl( uv );
  //   col += (1. - ds) * col2 + ds * col1;
  // }
  // else if (shapechoice == 3.0) {
  //   float as = anotherSwirl( uv );
  //   col += (1. - as) * col1 + as * col2;
  // }
 return col;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy -.5*u_resolution.xy)/u_resolution.y;
	
    vec3 col = vec3(0);
  
   vec3 cs = checkSymmetry( uv);
   //col += cs;
 
   col += chooseShape(tileChoice, uv, colA, colB, colC);
 
    gl_FragColor = vec4(col,1.0);
}
