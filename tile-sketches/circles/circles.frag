// Frag shader creates tiles for wave function collapse

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
uniform float tileChoice;

#define S smoothstep
#define CG colorGradient
#define PI 3.14159

// Define choosen colors
#define colA vec3(colorAr, colorAg, colorAb)/255.
#define colB vec3(colorBr, colorBg, colorBb)/255.

// Grid Colors
#define RED vec3(255,0,0)/255.
#define YELLOW vec3(255,255,0)/255.

// Tile colors

#define GREEN vec3(83,255,69)/255.
#define LAVENDER vec3(163,147,191)/255.
#define ROSE vec3(244,91,105)/255.
#define ORANGE vec3(255,82,27)/255.
//#define YELLOW vec3(255,177,0)/255.
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

float sdPie( in vec2 p, in vec2 c, in float r )
{
    p.x = abs(p.x);
    float l = length(p) - r;
    float m = length(p-c*clamp(dot(p,c),0.0,r)); // c=sin/cos of aperture
    return max(l,m*sign(c.y*p.x-c.x*p.y));
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

// float circleTile( vec2 uv, float angle ) {
//   vec2 gv = Rot(angle) * uv;
//   float s1 = sdCircle( uv, 0.25 );
//   float m1 = S(0.008, 0.0, s1);
//   return m1;
// }

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
  float s1 = sdCircle( uv - vec2(0.5, 0.5), 0.5);
  float m1 = S(0.008, 0.0, s1);
  return m1;
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

float centerSwirl( vec2 uv) {
  float s1 = sdCircle( Rot(PI*0./13.25)*uv - vec2(0.5, 0.), 0.5);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle( Rot(-PI*1./6.)*uv - vec2(0.0, 0.5), 0.5);
  float m2 = S(0.008, 0.0, s2);
  float mm = m2 - min(m1,m2);
  return m1 - min(m1,m2);
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

float swirl4( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, 0.5), 1.0);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle( Rot(PI*1./7.5)*uv - vec2(0.775, 0.775), 1.025);
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

float curve2( vec2 uv) {
  float s1 = sdCircle( uv - vec2(0.5, 0.5), 1.0);
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdCircle( Rot(PI*0./7.5)*uv - vec2(0.45, 0.45), 0.45);
  float m2 = S(0.008, 0.0, s2);
  return m1 - m2;
} 

float centerBox( vec2 uv ) {
  float s1 = sdBox( uv - vec2(0.0, 0.0), vec2(0.5, 0.25));
  float m1 =  S(0.008, 0.0, s1);
  return m1;
}

float halfBox( vec2 uv ) {
  float s1 = sdBox( uv - vec2(0.5, 0.0), vec2(0.5, 0.5));
  float m1 =  S(0.008, 0.0, s1);
  return m1;
}

float quarterBox( vec2 uv ) {
  float s1 = sdBox( uv - vec2(0.75, 0.0), vec2(0.5, 0.5));
  float m1 =  S(0.008, 0.0, s1);
  return m1;
}

// Middle column
float column( vec2 uv) {
    float s1 = sdCircle(uv - vec2(.80, .0), .75);
    float m1 = S(.008, 0., s1);
    float s2 = sdCircle(uv - vec2(-.80, .0), .75);
    float m2 = S(.008, 0., s2);
    float s3 = sdCircle(uv - vec2(.0, .80), .75);
    float m3 = S(.008, 0., s3);
    float s4 = sdCircle(uv - vec2(.0, -.80), .75);
    float m4 = S(.008, 0., s4);
    float m = m1 + m2;
    return 1. - m;
}

// cross
float cross( vec2 uv) {
    float s1 = sdCircle(uv - vec2(.80, .0), .75);
    float m1 = S(.008, 0., s1);
    float s2 = sdCircle(uv - vec2(-.80, .0), .75);
    float m2 = S(.008, 0., s2);
    float s3 = sdCircle(uv - vec2(.0, .80), .75);
    float m3 = S(.008, 0., s3);
    float s4 = sdCircle(uv - vec2(.0, -.80), .75);
    float m4 = S(.008, 0., s4);
    float m11 = m1 + m2;
    float m12 = m3 + m4;
    return min(m11, m12);
}

float junction( vec2 uv) {
    float s1 = cross(uv);
    float m1 = S(.008, 0., s1);
    // this line adds a constrained cross
    //float s5 = sdBox(uv - vec2(0.0, 0.0), vec2(0.5, 0.25) );
    float s2 = sdCircle(uv - vec2(0.8, 0.0), .75);
    float m2 = S(.008, 0., s2);
    return min(m1, 1. - m2);
}

// 'lens'
  float lens( vec2 uv) {
    float s = sdCircle(uv - vec2(0.32, 0.0), 0.75);
    float m = S(.008, 0.0, s);
    return m;
   }

// double 'lens'
  float doubleLens( vec2 uv) {
    float s1 = sdCircle(uv - vec2(0.32, 0.0), 0.75);
    float m1 = S(.008, 0.0, s1);
    float s2 = sdCircle(uv - vec2(-0.32, 0.0), 0.75);
    float m2 = S(.008, 0.0, s2);
    float mm1 = m1 - m2 - max(m1,m2);
    float mm2 = m2 - m1 - max(m1,m2);
    return  min(m1, m2);
    //return (mm1 + mm2 - min(mm1, mm2));
   }

 // rainbow on edge
 float rainbow( vec2 uv) {
   float s1 = sdCircle(uv - vec2(0.0, -0.5), 0.5);
   float m1 = S(.008, 0., s1);
   float s2 = sdCircle(uv - vec2(0.0, -0.5), 0.25);
   float m2 = S(.008, 0., s2);
   return m1 - m2;
   }
   
   // half circle on edge
 float btHalfCircle( vec2 uv) {
    float s = sdCircle(uv - vec2(0.0, -0.5), 0.25);
    float m = S(.008, 0., s);
    return m;
   }
   // two half circle on outer edge
 float twoHalfCircles( vec2 uv) {
    float s1 = sdCircle(uv - vec2(-0.375, -0.5), 0.125);
    float m1 = S(.008, 0., s1);
    float s2 = sdCircle(uv - vec2(0.375, -.5), .125);
    float m2 = S(.008, 0., s2);
    return m1 + m2;
   }

float fourHalfCircles( vec2 uv) {
    vec2 st = vec2(abs(uv.x), uv.y);
    float s1 = sdCircle(st - vec2(0.125, -0.5), 0.1225);
    float m1 = S(.008, 0., s1);
    float s2 = sdCircle(st - vec2(0.375, -.5), .1225);
    float m2 = S(.008, 0., s2);
     float s3 = sdCircle(st - vec2(0.125, 0.5), 0.1225);
    float m3 = S(.008, 0., s3);
    float s4 = sdCircle(st - vec2(0.375, 0.5), .1225);
    float m4 = S(.008, 0., s4);
    return m1 + m2 + m3 + m4;
   }

float twoBigHalfCircles( vec2 uv) {
    float s1 = sdCircle(uv - vec2(-0.25, -0.5), 0.25);
    float m1 = S(.008, 0., s1);
    float s2 = sdCircle(uv - vec2(0.25, -0.5), .25);
    float m2 = S(.008, 0., s2);
    float s3 = sdCircle(uv - vec2(-0.25, 0.5), 0.25);
    float m3 = S(.008, 0., s3);
    float s4 = sdCircle(uv - vec2(0.25, 0.5), .25);
    float m4 = S(.008, 0., s4);
    return m1 + m2 + m3 + m4;
   }

float columnCircles( vec2 uv) {
    float s1 = sdCircle(uv - vec2(-0.25, -0.5), 0.2475);
    float m1 = S(.008, 0., s1);
    float s2 = sdCircle(uv - vec2(0.25, -0.5), .2475);
    float m2 = S(.008, 0., s2);
    float s3 = sdCircle(uv - vec2(-0.25, 0.5), 0.2475);
    float m3 = S(.008, 0., s3);
    float s4 = sdCircle(uv - vec2(0.25, 0.5), .2475);
    float m4 = S(.008, 0., s4);
    float mm = m1 + m2 + m3 + m4;
    float m5 = column( uv );
    return mm + m5 - min(mm, m5);
   }

float columnCircles2( vec2 uv) {
    float s1 = sdCircle(uv - vec2(-0.25, -0.5), 0.2475);
    float m1 = S(.008, 0., s1);
    float s2 = sdCircle(uv - vec2(0.25, -0.5), .2475);
    float m2 = S(.008, 0., s2);
    float s3 = sdCircle(uv - vec2(-0.25, 0.5), 0.2475);
    float m3 = S(.008, 0., s3);
    float s4 = sdCircle(uv - vec2(0.25, 0.5), .2475);
    float m4 = S(.008, 0., s4);
    float mm = m1 + m2 + m3 + m4;
    float m5 = column( Rot(PI*2./4.)*uv );
    return mm + m5 - min(mm, m5);
   }

 float bigCircle( vec2 uv) {
    float s1 = sdCircle(uv, 0.5);
    float m1 = S(.008, 0., s1);
    return m1 ;
   } 

// Choose shape
vec3 chooseShape( float shapechoice, vec2 uv, vec3 col1, vec3 col2 ) {
  vec3 col = vec3(0.0);     
  if (shapechoice == 0.0) {
     col = col1;
  }
  else if (shapechoice == 1.0) {
    col = col2;
  }
  // Half circle
  else if (shapechoice == 2.0) {
    float s2 = sdCircle( uv-vec2(0.5, 0.0), 0.5 );
    float m2 = S(0.008, 0.0, s2);
    col += (1. - m2) * col1 + m2 * col2;
  }
  // Half circle
  else if (shapechoice == 3.0) {
    float s2 = sdCircle( uv-vec2(0.5, 0.0), 0.5 );
    float m2 = S(0.008, 0.0, s2);
    col += (1. - m2) * col2 + m2 * col1;
  }
  // Arc
  else if (shapechoice == 4.0) { 
    float s3 = sdCircle( uv - vec2(-0.5, -0.5), 1.0);
    float m3 = S(0.008, 0.0, s3);
    col += (1. - m3) * col1 + m3 * col2;
  }
else if (shapechoice == 5.0) { 
  float s3 = sdCircle( uv - vec2(-0.5, -0.5), 1.0);
  float m3 = S(0.008, 0.0, s3);
  col += (1. - m3) * col2 + m3 * col1;
  }
// else if (shapechoice == 6.0) { 
//      //quarter circle
//     float bc2 = quarterCircle(uv );
//     col += (1. - bc2) * col1 + bc2 * col2;
//   }
  // else if (shapechoice == 7.0) {
  //   float qc = halfCircle(uv );
  //   col += (1. - qc) * col1 + qc * col2;
  // }
  // // Center swirl bigger
  //  else if (shapechoice == 9.0) {
  //   float cts = centerSwirl( uv );
  //   col += (1. - cts) * col1 + cts * col2;
  // }
  // // Center swirl skinnier
  //  else if (shapechoice == 10.0) {
  //   float cts2 = centerSwirl2( uv );
  //   col += (1. - cts2) * col1 + cts2 * col2;
  // }
  // else if (shapechoice == 11.0) {
  //   float s = swirl( uv );
  //   col += (1. - s) * col1 + s * col2;
  // }
 
//  else if (shapechoice == 12.0) {
//     float sw = swirl2( uv );
//     col += (1. - sw) * col1 + sw * col2;
//   }
  
//   else if (shapechoice == 13.0) {
//     float sw3 = swirl3( uv );
//     col += (1. - sw3) * col1 + sw3 * col2;
//   }
//   else if (shapechoice == 14.0) {
//     float ms = swirl4( uv );
//     col += (1. - ms) * col1 + ms * col2;
//   }
//  else if (shapechoice == 15.0) { 
//     float sw5 = swirl5( uv );
//     col += (1. - sw5) * col1 + sw5 * col2;
//   }
//  else if (shapechoice == 16.0) {
//     float cm = column( uv );
//     col += (1. - cm) * col1 + cm * col2;
//   }
//   else if (shapechoice == 17.0) {
//     float j = junction( uv );
//     col += (1. - j) * col1 + j * col2;
//   }
//   else if (shapechoice == 18.0) {
//     float l = lens( uv );
//     col += (1. - l) * col1 + l * col2;
//   }
//   else if (shapechoice == 19.0) {
//     float cr = cross( uv );
//     col += (1. - cr) * col1 + cr * col2;
//   }
//   else if (shapechoice == 20.0) {
//     float cb = centerBox( uv );
//     col += (1. - cb) * col1 + cb * col2;
//   }
//   else if (shapechoice == 21.0) {
//     float sl = slice( uv );
//     col += (1. - sl) * col1 + sl * col2;
//   }
//   else if (shapechoice == 22.0) {
//     float sls = slices( uv );
//     col += (1. - sls) * col1 + sls * col2;
//   }
//    else if (shapechoice == 23.0) {
//     float oc = offsetCircle( uv );
//     col += (1. - oc) * col1 + oc * col2;
//   }
//   else if (shapechoice == 24.0) {
//     float hb = halfBox( uv );
//     col += (1. - hb) * col1 + hb * col2;
//   }
//   else if (shapechoice == 25.0) {
//     float qb = quarterBox( uv );
//     col += (1. - qb) * col1 + qb * col2;
//   }
//   else if (shapechoice == 26.0) {
//     float sw4 = swirl4( uv );
//     col += (1. - sw4) * col1 + sw4 * col2;
//   }
//   else if (shapechoice == 27.0) {
//     float cv = curve( uv );
//     col += (1. - cv) * col1 + cv * col2;
//   }
//   else if (shapechoice == 28.0) {
//     float cv2 = curve2( uv );
//     col += (1. - cv2) * col1 + cv2 * col2;
//   }
  
//   else if (shapechoice == 29.0) {
//     float shc = smallHalfCircle( uv );
//     col += (1. - shc) * col1 + shc * col2;
//   }
//    else if (shapechoice == 30.0) {
//     float shc2 = smallerHalfCircle( uv );
//     col += (1. - shc2) * col1 + shc2 * col2;
//   }
//    else if (shapechoice == 31.0) {
//     float ds = doubleSwirl( uv );
//     col += (1. - ds) * col1 + ds * col2;
//   }
//   else if (shapechoice == 33.0) {
//     float as = anotherSwirl( uv );
//     col += (1. - as) * col1 + as * col2;
//   }
//   else if (shapechoice == 34.0) {
//     float bhc = btHalfCircle( uv );
//     col += (1. - bhc) * col1 + bhc * col2;
//   }
//   else if (shapechoice == 35.0) {
//     float thc = twoHalfCircles( uv );
//     col += (1. - thc) * col1 + thc * col2;
//   }
//   else if (shapechoice == 36.0) {
//     float tbhc = twoBigHalfCircles( uv );
//     col += (1. - tbhc) * col1 + tbhc * col2;
//   }
// else if (shapechoice == 37.0) {
//     float fhc = fourHalfCircles( uv );
//     col += (1. - fhc) * col1 + fhc * col2;
//   }
//    else if (shapechoice == 38.0) {
//     float rb = rainbow( uv );
//     col += (1. - rb) * col1 + rb * col2;
//   }
//     else if (shapechoice == 39.0) {
//     float bc = bigCircle( uv );
//     col += (1. - bc) * col1 + bc * col2;
//   }
//   else if (shapechoice == 40.0) {
//     float ccs = columnCircles( uv );
//     col += (1. - ccs) * col1 + ccs * col2;
//   }
//   else if (shapechoice == 41.0) {
//     float ccs2 = columnCircles2( uv );
//     col += (1. - ccs2) * col1 + ccs2 * col2;
//   }
//    else if (shapechoice == 42.0) {
//     float dls = doubleLens( uv );
//     col += (1. - dls) * col1 + dls * col2;
//   }
 return col;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy -.5*u_resolution.xy)/u_resolution.y;
	
    vec3 col = vec3(0);
  
   vec3 cs = checkSymmetry( uv);
   //col += cs;

  col += chooseShape(tileChoice, uv, colA, colB);
  gl_FragColor = vec4(col,1.0);
}
