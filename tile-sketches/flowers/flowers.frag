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

#define S smoothstep
#define CG colorGradient
#define PI 3.14159

// grid colors
#define RED vec3(255,0,0)/255.
#define YELLOW vec3(255,255,0)/255.

#define PURPLE vec3(156,82,139)/255.
#define PINK vec3(247,178,183)/255.
#define GREEN vec3(183,206,99)/255.
#define NAVY vec3(32,6,59)/255.

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

// From Inigo Quilez
//combine so that they smoothly blend
float smin( in float a, in float b, float k)
{
 float h = max( k - abs(a-b), 0.0); // "spike" function look at grpahtoy
 return min(a,b) - h*h/(k*4.0);
}

// sdf functions for shapes from Inigo Quilez
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

//From Inigo Quilez
float sdEllipse( in vec2 p, in vec2 ab )
{
    p = abs(p); if( p.x > p.y ) {p=p.yx;ab=ab.yx;}
    float l = ab.y*ab.y - ab.x*ab.x;
    float m = ab.x*p.x/l;      float m2 = m*m; 
    float n = ab.y*p.y/l;      float n2 = n*n; 
    float c = (m2+n2-1.0)/3.0; float c3 = c*c*c;
    float q = c3 + m2*n2*2.0;
    float d = c3 + m2*n2;
    float g = m + m*n2;
    float co;
    if( d<0.0 )
    {
        float h = acos(q/c3)/3.0;
        float s = cos(h);
        float t = sin(h)*sqrt(3.0);
        float rx = sqrt( -c*(s + t + 2.0) + m2 );
        float ry = sqrt( -c*(s - t + 2.0) + m2 );
        co = (ry+sign(l)*rx+abs(g)/(rx*ry)- m)/2.0;
    }
    else
    {
        float h = 2.0*m*n*sqrt( d );
        float s = sign(q+h)*pow(abs(q+h), 1.0/3.0);
        float u = sign(q-h)*pow(abs(q-h), 1.0/3.0);
        float rx = -s - u - c*4.0 + 2.0*m2;
        float ry = (s - u)*sqrt(3.0);
        float rm = sqrt( rx*rx + ry*ry );
        co = (ry/sqrt(rm-rx)+2.0*g/rm-m)/2.0;
    }
    vec2 r = ab * vec2(co, sqrt(1.0-co*co));
    return length(r-p) * sign(p.y-r.y);
}

// From Inigo Quilez
float sdRoundedBox( vec2 uv, vec2 b, vec4 r) {
  r.xy = (uv.x>0.0) ? r.xy : r.zw;
  r.x = (uv.y>0.0) ? r.x : r.y;
  vec2 q = abs(uv) - b + r.x;
  return min( max(q.x, q.y), 0.0) + length(max(q, 0.0) ) - r.x;
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

float quarterFlower( vec2 uv ) {
  vec2 st = vec2(abs(uv.x), uv.y);
  float s1 = sdCircle( uv - vec2(0.0, 0.0), 0.20);
  float m1 = S(.008, .0, s1);
  float s2 = sdCircle( uv - vec2(0.3, 0.0), 0.175);
  float m2 = S(.008, .0, s2);
  float s3 = sdCircle( Rot(PI*2./8.)*uv - vec2(0.25, 0.0), 0.15);
  float m3 = S(.008, .0, s3);
  float s4 = sdCircle( Rot(PI*4./8.)*uv - vec2(0.25, 0.0), 0.15);
  float m4 = S(.008, .0, s4);
  float s5= sdCircle( Rot(PI*6./8.)*uv - vec2(0.25, 0.0), 0.15);
  float m5= S(.008, .0, s5);
  float s6= sdCircle( Rot(PI*10./8.)*uv - vec2(0.325, 0.0), 0.15);
  float m6= S(.008, .0, s6);
  float s7= sdCircle( Rot(PI*12./8.)*uv - vec2(0.3, 0.0), 0.175);
  float m7= S(.008, .0, s7);
  float s8= sdCircle( Rot(PI*8./8.)*uv - vec2(0.3, 0.0), 0.175);
  float m8= S(.008, .0, s8);
  float s9= sdCircle( Rot(PI*14./8.)*uv - vec2(0.3, 0.0), 0.175);
  float m9= S(.008, .0, s9);
  
  return m1 + m2 + m3 + m4 + m5 + m6 + m7 + m8 + m9;
}

float sdHalfFlower( vec2 uv, vec2 offset  ) {
  vec2 gv = uv - offset;
  float s1= sdCircle(gv - vec2(0.0, 0.0), 0.1);
  float m1 = S(.008, .0, s1);
  float s2 = sdEllipse(Rot(PI * 0./4.) * vec2(gv.x, abs(gv.y)) - vec2(0.0, 0.3), vec2(.04, .19));
  float m2 = S(.008, .0, s2);
  float s3 = sdEllipse(Rot(PI * 2./8.) * vec2(gv.x, abs(gv.y)) - vec2(0.0, 0.30), vec2(.04, .19));
  float m3 = S(.008, .0, s3);
   float s4 = sdEllipse(Rot(PI * 2./4.) * vec2(gv.x, abs(gv.y)) - vec2(0.00, 0.3), vec2(.04, .19));
  float m4 = S(.008, .0, s4);
   float s5 = sdEllipse(Rot(PI * 1.5/12.) * vec2(gv.x, abs(gv.y)) - vec2(0.0, 0.3), vec2(.04, .20));
  float m5 = S(.008, .0, s5);
    float s6 = sdEllipse(Rot(PI * 4.5/12.) * vec2(gv.x, abs(gv.y)) - vec2(0.00, 0.3), vec2(.04, .19));
  float m6 = S(.008, .0, s6);
  
  return  m1 + m2 + m3  + m4  + m5 + m6;
}

// NE, SE, NW, SW
float sdHalfFlower2( vec2 uv, vec2 offset  ) {
  vec2 gv = uv - offset;
  float s1= sdCircle(gv - vec2(0.0, 0.0), 0.1);
  float m1 = S(.008, .0, s1);
  float s2 = sdEllipse(Rot(PI * 0./4.) * vec2(gv.x, abs(gv.y)) - vec2(0.0, 0.3), vec2(.04, .19));
  float m2 = S(.008, .0, s2);
  float s3 = sdEllipse(Rot(PI * 2./8.) * vec2(gv.x, abs(gv.y)) - vec2(0.0, 0.30), vec2(.04, .19));
  float m3 = S(.008, .0, s3);
  float s4 = sdEllipse(Rot(PI * 2./4.) * vec2(gv.x, abs(gv.y)) - vec2(0.00, 0.3), vec2(.04, .19));
  float m4 = S(.008, .0, s4);
  float s5 = sdEllipse(Rot(PI * 1.5/12.) * vec2(gv.x, abs(gv.y)) - vec2(0.0, 0.3), vec2(.04, .20));
  float m5 = S(.008, .0, s5);
  float s6 = sdEllipse(Rot(PI * 4.5/12.) * vec2(gv.x, abs(gv.y)) - vec2(0.00, 0.3), vec2(.04, .19));
  float m6 = S(.008, .0, s6);
  float mm = m1 + m2 + m3  + m4  + m5 + m6;
  float s7 = sdBox( uv - vec2(-0.5, 0.0), vec2(0.75, 0.05));
  float m7 = S(.008, .0, s7);
  // float s7 = abs(sdRoundedBox( uv - vec2(0.5, -0.75), vec2(0.75, 0.75), vec4(0.0, 0.0, 0.5, 0.0))) - 0.05;
  // float m7 = S(.008, .0, s7);
  return  mm + m7;
}


// // NE, SE, NW, SW
// float stem( vec2 uv) {
//   float s1 = abs(sdRoundedBox( uv - vec2(0.25, 0.25), vec2(0.5, 0.5), vec4(0.0, 0.0, 0.0, 0.5))) - 0.05;
//   float m1 = S(.008, .0, s1);
//   return m1;
// }

// NE, SE, NW, SW
float stem( vec2 uv) {
  float s1 = abs(sdRoundedBox( uv - vec2(0.5, 0.5), vec2(0.5, 0.5), vec4(0.0, 0.0, 0.0, 0.5))) - 0.05;
  float m1 = S(.008, .0, s1);
  return m1;
}

// NE, SE, NW, SW
float stem2( vec2 uv) {
  float s1 = abs(sdRoundedBox( uv - vec2(0.5, 0.5), vec2(0.5, 0.5), vec4(0.0, 0.0, 0.0, 0.5))) - 0.05;
  float m1 = S(.008, .0, s1);
  float s2 = abs(sdRoundedBox( uv - vec2(-0.5, -0.5), vec2(0.5, 0.5), vec4(0.5, 0.0, 0.0, 0.0))) - 0.05;
  float m2 = S(.008, .0, s2);
  return m1 + m2;
}
// NE, SE, NW, SW
float stem3( vec2 uv) {
  float s1 = abs(sdRoundedBox( uv - vec2(0.5, 0.5), vec2(0.5, 0.5), vec4(0.0, 0.0, 0.0, 0.5))) - 0.05;
  float m1 = S(.008, .0, s1);
  float s2 = abs(sdRoundedBox( uv - vec2(-0.5, -0.5), vec2(0.5, 0.5), vec4(0.5, 0.0, 0.0, 0.0))) - 0.05;
  float m2 = S(.008, .0, s2);
  float s3 = abs(sdRoundedBox( uv - vec2(0.5, -0.5), vec2(0.5, 0.5), vec4(0.0, 0.0, 0.5, 0.0))) - 0.05;
  float m3 = S(.008, .0, s3);
  float s4 = abs(sdRoundedBox( uv - vec2(-0.5, 0.5), vec2(0.5, 0.5), vec4(0.0, 0.5, 0.0, 0.0))) - 0.05;
  float m4 = S(.008, .0, s4);
  return m1 + m2 + m3 + m4;
}
// // NE, SE, NW, SW
// float stem2( vec2 uv) {
//   float s1 = abs(sdRoundedBox( uv - vec2(0.25, 0.45), vec2(0.5, 0.5), vec4(0.0, 0.0, 0.0, 0.5))) - 0.05;
//   float m1 = S(.008, .0, s1);
//   float s2 = sdBox(uv - vec2(0.25, 0.0), vec2(0.25, 0.5));
//   float m2 = S(.008, .0, s2);
//   float mm1 = m1 - m2;
//   float s3 = abs(sdRoundedBox( uv - vec2(-0.25, -0.45), vec2(0.5, 0.5), vec4(0.5, 0.0, 0.0, 0.0))) - 0.05;
//   float m3 = S(.008, .0, s3);
//   float s4 = sdBox(uv - vec2(-0.25, 0.0), vec2(0.25, 0.5));
//   float m4 = S(.008, .0, s4);
//   float mm2 = m3 - m4;
//   float s5 = sdEgg( uv*Rot(3./16.*PI)- vec2(0.0,0.05), .12, .009);
//   float m5 = S(.008, .0, s5);
//   float mm3 =  max(mm1, mm2);
//   return mm3 + m5 - min(mm3, m5);
// }

// Choose shape
vec3 chooseShape( float shapechoice, vec2 uv, vec3 col1, vec3 col2 ) {
  vec3 col = vec3(0.0);

   if (shapechoice == 0.0) {
     col = col1;
   }
  else if (shapechoice == 1.0) {
     float f = sdHalfFlower(uv, vec2(0.5, 0.0));
     col += (1. - f) * col1 + f * col2;
  //float m = S(0.008, 0.0, s);  
  }
  else if (shapechoice == 2.0) {
     float f2 = sdHalfFlower2(uv, vec2(0.5, 0.0));
     col += (1. - f2) * col1 + f2 * col2;
  }
  // else if (shapechoice == 3.0) {
  //    float f3 = sdHalfFlower2(vec2(-uv.x, uv.y), vec2(0.5, 0.0));
  //    col += (1. - f3) * col1 + f3 * col2;
  // }
  else if (shapechoice == 3.0) {
     float qf = quarterFlower( uv - vec2( 0.5, 0.5));
     col += (1. - qf) * col1 + qf * col2;
  }
 else if (shapechoice == 4.0) {
     float st = stem( uv );
     col += (1. - st) * col1 + st * col2;
  }
else if (shapechoice == 5.0) {
     float st2 = stem2( uv );
     col += (1. - st2) * col1 + st2 * col2;
  }
  else if (shapechoice == 6.0) {
     float st2 = stem3( uv );
     col += (1. - st2) * col1 + st2 * col2;
  }
 return col;
}

void main()
  {
  vec2 uv = (gl_FragCoord.xy -.5*u_resolution.xy)/u_resolution.y;
    
  vec3 col = vec3(0);
  
  vec3 cs = checkSymmetry( uv ); 
 //col += cs;

  col += chooseShape(tileChoice, uv, colA, colB);
  //col += chooseShape(tileChoice, uv, PURPLE, NAVY);
  
  gl_FragColor = vec4(col,1.0);
}
