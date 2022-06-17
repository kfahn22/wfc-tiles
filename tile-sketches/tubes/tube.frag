// Frag shader creates "worm' tiles for wave function collapse

#ifdef GL_ES
precision mediump float;
#endif

// Pass in resolution from the sketch.js file
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

// Colors for grid
#define RED vec3(255,0,0)/255.
#define YELLOW vec3(255,255,0)/255.

// Define choosen colors
#define colA vec3(colorAr, colorAg, colorAb)/255.
#define colB vec3(colorBr, colorBg, colorBb)/255.

#define GREY vec3(201,206,204)/255.
#define TEAL1 vec3(18,88,98)/255.
#define TEAL vec3(54,88,101)/255.
#define LTGREY vec3(251,249,248)/255.


#define WHITE vec3(1.)/255.

#define PURPLE vec3(63,46,86)/255.
#define MAUVE vec3(187,182,223)/255.

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

//From Inigo Quilez
float sdBox( vec2 uv, vec2 b )
{
    vec2 d = abs(uv)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdCircle( vec2 uv, float r) {
  return length(uv) - r;
} 

float Arc( vec2 uv, float r1, float r2) {
  return abs(sdCircle(uv, r1)) - r2;
}

// From Inigo Quilez
float sdArc( in vec2 p, in vec2 sc, in float ra, float rb )
{
    // sc is the sin/cos of the arc's aperture
    p.x = abs(p.x);
    return ((sc.y*p.x>sc.x*p.y) ? length(p-sc*ra) : 
                                  abs(length(p)-ra)) - rb;
}

// From Inigo Quilez
float sdVesica(vec2 uv, float r, float d)
{
    uv = abs(uv);
    float b = sqrt(r*r-d*d);
    return ((uv.y-b)*d>uv.x*b) ? length(uv-vec2(0.0,b))
                             : length(uv-vec2(-d,0.0))-r;
}

// From Inigo Quilez
float sdEgg( vec2 p, float ra, float rb )
{
    const float k = sqrt(3.0);
    p.x = abs(p.x);
    float r = ra - rb;
    return ((p.y<0.0)       ? length(vec2(p.x,  p.y    )) - r :
            (k*(p.x+r)<p.y) ? length(vec2(p.x,  p.y-k*r)) :
                              length(vec2(p.x+r,p.y    )) - 2.0*r) - rb;
}

float dot2(in vec2 v ) { return dot(v,v); }
// From Inigo Quilez
float sdTrapezoid(  vec2 p, float r1, float r2, float he )
{
    vec2 k1 = vec2(r2,he);
    vec2 k2 = vec2(r2-r1,2.0*he);
    p.x = abs(p.x);
    vec2 ca = vec2(p.x-min(p.x,(p.y<0.0)?r1:r2), abs(p.y)-he);
    vec2 cb = p - k1 + k2*clamp( dot(k1-p,k2)/dot2(k2), 0.0, 1.0 );
    float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
    return s*sqrt( min(dot2(ca),dot2(cb)) );
}

// From Inigo Quilez
float sdMoon(vec2 p, float d, float ra, float rb )
{
    p.y = abs(p.y);
    float a = (ra*ra - rb*rb + d*d)/(2.0*d);
    float b = sqrt(max(ra*ra-a*a,0.0));
    if( d*(p.x*b-p.y*a) > d*d*max(b-p.y,0.0) )
          return length(p-vec2(a,b));
    return max( (length(p          )-ra),
               -(length(p-vec2(d,0))-rb));
}
// // From Inigo Quilez
// float sdEquilateralTriangle( vec2 p )
// {
//     const float k = sqrt(3.0);
//     p.x = abs(p.x) - 1.0;
//     p.y = p.y + 1.0/k;
//     if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
//     p.x -= clamp( p.x, -2.0, 0.0 );
//     return -length(p)*sign(p.y);
// }
// // From Inigo Quilez
// float sdTriangleIsosceles( vec2 p, vec2 q )
// {
//     p.x = abs(p.x);
//     vec2 a = p - q*clamp( dot(p,q)/dot(q,q), 0.0, 1.0 );
//     vec2 b = p - q*vec2( clamp( p.x/q.x, 0.0, 1.0 ), 1.0 );
//     float s = -sign( q.y );
//     vec2 d = min( vec2( dot(a,a), s*(p.x*q.y-p.y*q.x) ),
//                   vec2( dot(b,b), s*(p.y-q.y)  ));
//     return -sqrt(d.x)*sign(d.y);
// }

// From Inigo Quilez
// For vec4 r corners are NE, SE, NW, SW
float sdRoundedBox( vec2 uv, vec2 b, vec4 r) {
  r.xy = (uv.x>0.0) ? r.xy : r.zw;
  r.x = (uv.y>0.0) ? r.x : r.y;
  vec2 q = abs(uv) - b + r.x;
  return min( max(q.x, q.y), 0.0) + length(max(q, 0.0) ) - r.x;
}

// From Inigo Quilez
//combine so that they smoothly blend
float smin( in float a, in float b, float k)
{
 float h = max( k - abs(a-b), 0.0); // "spike" function look at grpahtoy
 return min(a,b) - h*h/(k*4.0);
}

// Function to choose colors 
vec3 chooseColor( float choice ) {
    vec3 colchoice;
    
    if ( choice == 0.0 )  { //white
      colchoice = vec3( 1.0 ); 
    } // blank tile
    else if ( choice  == 1.0 ) { //black
      colchoice = vec3(0.0);
          }
    else if ( choice  == 2.0 ) { //grey
      colchoice = vec3(125,125,125)/255.0;
    }
    else if ( choice  == 3.0 ) { //red
      colchoice = vec3(255, 0, 0)/255.0;
    }
    else if ( choice  == 4.0 ) { //orange
      colchoice = vec3(255,127,0)/255.0;
    }
    else if ( choice  == 5.0 ) { //yellow
      colchoice = vec3(255,255,0)/255.0;
    }
    else if ( choice  == 6.0 ) { //green
      colchoice = vec3(0,255,0)/255.0;
    }
    else if ( choice  == 7.0 ) { // blue
      colchoice = vec3(0,0,255)/255.0;
    }
    else if ( choice == 8.0 ) { // violet
      colchoice = vec3(255,0,255)/255.0;
    }
  return colchoice;
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

// Small square corner
float sdSmallCorner( vec2 uv ) {
  float s1 = sdBox( uv - vec2(-0.5, 0.25), vec2(0.25, 0.05) );
  float m1 = S(.008, .0, s1);
  float s2 = sdBox( uv - vec2(-0.25,0.35), vec2(0.05, 0.15) );
  float m2 = S(.008, .0, s2);
  return m1 + m2 - min(m1, m2);
}

// Two small square corners
float sdSmallCorners( vec2 uv ) {
  float s1 = sdBox( uv - vec2(-0.5, 0.25), vec2(0.25, 0.05) );
  float m1 = S(.008, .0, s1);
  float s2 = sdBox( uv - vec2(-0.25,0.35), vec2(0.05, 0.15) );
  float m2 = S(.008, .0, s2);
  float mm1 = m1 + m2 - min(m1, m2);
  float s3 = sdBox( uv - vec2(0.35, -0.25), vec2(0.15, 0.05) );
  float m3 = S(.008, .0, s3);
  float s4 = sdBox( uv - vec2(0.25,-0.35), vec2(0.05, 0.15) );
  float m4 = S(.008, .0, s4);
  float mm2 = m3 + m4 - min(m3, m4);
  return mm1 + mm2 - min(mm1,mm2);
}

// Large square corner
float sdLargeCorner( vec2 uv ) {
  float s1 = sdBox( uv - vec2(-0.25, 0.25), vec2(0.55, 0.05) );
  float m1 = S(.008, .0, s1);
  float s2 = sdBox( uv - vec2(0.25, -0.25), vec2(0.05, 0.45) );
  float m2 = S(.008, .0, s2);
  return m1 + m2 - min(m1, m2);
}

// two  squares of different sizes
float twoSquareCorners( vec2 uv ) {
  float s1 = sdBox( uv - vec2(-0.5, 0.25), vec2(0.25, 0.05) );
  float m1 = S(.008, .0, s1);
  float s2 = sdBox( uv - vec2(-0.25,0.35), vec2(0.05, 0.15) );
  float m2 = S(.008, .0, s2);
  float mm1 = m1 + m2 - min(m1, m2);
  float s3 = sdBox( uv - vec2(-0.25, -0.25), vec2(0.55, 0.05) );
  float m3 = S(.008, .0, s3);
  float s4 = sdBox( uv - vec2(0.25, 0.25), vec2(0.05, 0.45) );
  float m4 = S(.008, .0, s4);
  float mm2 = m3 + m4 - min(m3,m4);
  return mm1 + mm2 ;
}
float sdKink1( vec2 uv) {
  float s1 = sdBox( uv - vec2(-0.25, 0.25), vec2(0.25, 0.05) );
  float m1 = S(.008, .0, s1);
  float s2 = sdBox( uv - vec2(0.0, 0.0), vec2(0.05, 0.3) );
  float m2 = S(.008, .0, s2);
  float s3 = sdBox( uv - vec2(0.25, -0.25), vec2(0.25, 0.05) );
  float m3 = S(.008, .0, s3);
  return m1 + m2 + m3 - min(m1, m2) - min(m3, m2);
}



float twoCircles2( vec2 uv) {
  float s1 = abs(sdCircle( uv - vec2(-0.5, -0.5), 0.25)) - 0.05;
  float m1 = S(.008, .0, s1);
  float s2 = abs(sdCircle( uv - vec2(0.5, 0.5), 0.75)) - 0.05;
  float m2 = S(.008, .0, s2);
  return m1 + m2;
}

float sdBigCircle( vec2 uv) {
  float s1 = abs(sdCircle( uv - vec2(-0.5, -0.5), 0.75)) - 0.05;
  float m1 = S(.008, .0, s1);
  return m1;
}

float sdBigCircles( vec2 uv) {
  float s1 = abs(sdCircle( uv - vec2(-0.5, -0.5), 0.75)) - 0.05;
  float m1 = S(.008, .0, s1);
  float s2 = abs(sdCircle( uv - vec2(0.5, 0.5), 0.75)) - 0.05;
  float m2 = S(.008, .0, s2);
  return m1 + m2 - min(m1,m2);
}



float straightLines( vec2 uv ) {
  float s1 = sdBox( uv - vec2(0.0, 0.25), vec2(0.5, 0.05));
  float m1 = S(0.008, 0.0, s1);
  float s2 = sdBox( uv - vec2(0.0, -0.25), vec2(0.5, 0.05));
  float m2 = S(0.008, 0.0, s2);
  return m1 + m2;
}

float uTurn( vec2 uv ) {
  float s1 = abs(sdRoundedBox( uv - vec2(-0.35, 0.00), vec2(.25, .25), vec4(0.25, 0.25, 0.0, 0.0))) - 0.05;
  float m1 = S(0.008, 0.0, s1);
  return m1 ;
}

float uTurns( vec2 uv ) {
  float s1 = abs(sdRoundedBox( uv - vec2(-0.35, 0.00), vec2(.25, .25), vec4(0.25, 0.25, 0.0, 0.0))) - 0.05;
  float m1 = S(0.008, 0.0, s1);
  float s2 = abs(sdRoundedBox( uv - vec2(0.35, 0.00), vec2(.25, .25), vec4(0.0, 0.0, 0.25, 0.25))) - 0.05;
  float m2 = S(0.008, 0.0, s2);
  return m1 + m2 ;
}

float cornerCircle( vec2 uv) {
  float s1 = abs(sdCircle( uv - vec2(-0.5, -0.5), 0.25)) - 0.05;
  float m1 = S(.008, .0, s1);
  return m1;
}

float twoCornerCircles( vec2 uv) {
  float s1 = abs(sdCircle( uv - vec2(-0.5, -0.5), 0.25)) - 0.05;
  float m1 = S(.008, .0, s1);
  float s2 = abs(sdCircle( uv - vec2(0.5, 0.5), 0.25)) - 0.05;
  float m2 = S(.008, .0, s2);
  return m1 + m2;
}

float threeCornerCircles( vec2 uv) {
  float s1 = abs(sdCircle( uv - vec2(-0.5, -0.5), 0.25)) - 0.05;
  float m1 = S(.008, .0, s1);
  float s2 = abs(sdCircle( uv - vec2(0.5, 0.5), 0.25)) - 0.05;
  float m2 = S(.008, .0, s2);
  float s3 = abs(sdCircle( uv - vec2(0.5, -0.5), 0.25)) - 0.05;
  float m3 = S(.008, .0, s3);
  return m1 + m2 + m3;
}

float fourCornerCircles( vec2 uv) {
  float s1 = abs(sdCircle( uv - vec2(-0.5, -0.5), 0.25)) - 0.05;
  float m1 = S(.008, .0, s1);
  float s2 = abs(sdCircle( uv - vec2(0.5, 0.5), 0.25)) - 0.05;
  float m2 = S(.008, .0, s2);
  float s3 = abs(sdCircle( uv - vec2(-0.5, 0.5), 0.25)) - 0.05;
  float m3 = S(.008, .0, s3);
  float s4 = abs(sdCircle( uv - vec2(0.5, -0.5), 0.25)) - 0.05;
  float m4 = S(.008, .0, s4);
  return m1 + m2 + m3 + m4;
}

float twoCircles( vec2 uv) {
  float s1 = abs(sdCircle( uv - vec2(-0.5, -0.5), 0.25)) - 0.05;
  float m1 = S(.008, .0, s1);
  float s2 = abs(sdCircle( uv - vec2(-0.5, -0.5), 0.75)) - 0.05;
  float m2 = S(.008, .0, s2);
  return m1 + m2;
}
float teeCircles( vec2 uv) {
  float s1 = abs(sdCircle( uv - vec2(-0.5, 0.5), 0.25)) - 0.05;
  float m1 = S(.008, .0, s1);
  float s2 = abs(sdCircle( uv - vec2(0.5, 0.5), 0.25)) - 0.05;
  float m2 = S(.008, .0, s2);
  float s3 = sdBox( uv - vec2(0.0, -0.25), vec2(0.5, 0.05));
  float m3 = S(0.008, 0.0, s3);
  return m1 + m2 + m3;
}

// // Choose shape
vec3 chooseShape( float shapechoice, vec2 uv, vec3 col1, vec3 col2 ) {
  vec3 col = vec3(0.0);
       
   if (shapechoice == 0.0) {
     col = col1;
   }
    // Two concentric circles
  else if (shapechoice == 1.0) {
    float tc = twoCircles( uv );
    col += (1. - tc) * col1 + tc * col2;
  }
  else if (shapechoice == 2.0) {
    float sl = straightLines(uv);
    col += (1. - sl) * col1 + sl * col2;
  }
  // u turn
else if (shapechoice == 3.0) {
    float ut = uTurn(uv);
    col += (1. - ut) * col1 + ut * col2;
  }
  // Two u turns
 else if (shapechoice == 4.0) {
    float uts = uTurns(uv);
    col += (1. - uts) * col1 + uts * col2;
  }
    // Straight line with two corner circles 
 else if (shapechoice == 5.0) {
    float tc = teeCircles( uv  );
    col += (1. - tc) * col1 + tc * col2;
 }
  // two different size circles
  else if (shapechoice == 6.0) {
    float tc2 = twoCircles2(uv);
    col += (1. - tc2) * col1 + tc2 * col2;
  }
  // One corner circle
  // else if (shapechoice == 7.0) {
  //   float cc = cornerCircle( uv );
  //    col += (1. - cc) * col1 + cc * col2;
  // }
  // // Two corner circles
  // else if (shapechoice == 8.0) {
  //   float cc2 = twoCornerCircles( uv );
  //    col += (1. - cc2) * col1 + cc2 * col2;
  // }
  // // Three corner circles
  // else if (shapechoice == 9.0) {
  //   float cc2 = threeCornerCircles( uv );
  //    col += (1. - cc2) * col1 + cc2 * col2;
  // }
  // // Four corner circles
  //  else if (shapechoice == 10.0) {
  //   float cc4 = fourCornerCircles( uv );
  //   col += (1. - cc4) * col1 + cc4 * col2;
  // }
 

//  else if (shapechoice == 11.0) {
//      // Two corner circles
//     float bc = sdBigCircle(uv );
//     col += (1. - bc) * col1 + bc * col2;
//   }
// else if (shapechoice == 12.0) {
//      // Two corner circles
//     float bc2 = sdBigCircles(uv );
//     col += (1. - bc2) * col1 + bc2 * col2;
//   }
// else if (shapechoice == 13.0) {
//     float sbc = sdSmallCorner(uv);
//     col += (1. - sbc) * col1 + sbc * col2;
//   }
// else if (shapechoice == 14.0) {
//     float lc = sdLargeCorner(uv);
//     col += (1. - lc) * col1 + lc * col2;
//   }
// else if (shapechoice == 15.0) {
//     float scs = sdSmallCorners(uv);
//     col += (1. - scs) * col1 + scs * col2;
  // else if (shapechoice == 16.0) {
  //   float sqc = twoSquareCorners(uv);
  //   col += (1. - sqc) * col1 + sqc * col2;
  // }
 return col;
}

void main()
{
  vec2 uv = (gl_FragCoord.xy - .5*u_resolution.xy)/u_resolution.y;
  
  vec3 col = vec3(0.0);
  
  vec3 cs = checkSymmetry( uv );
  
 //col += cs;
  
  col += chooseShape( tileChoice, uv, colA, colB );
   
  gl_FragColor = vec4(col,1.0);
}
