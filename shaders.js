const SkyboxShaderFragment = `#version 300 es
precision mediump float;
layout (location = 0) out vec4 color;
in vec2 xy;
in vec3 norm;
in float dep;
uniform sampler2D albedo;
uniform sampler2D specular;
uniform sampler2D normal;
uniform sampler2D shadow;
uniform vec3 lightp[5];
uniform vec3 lightc[5];
uniform int lightt[5];
uniform vec3 ppos;
in vec3 posit;
float rand(vec2 co){
    return fract(dot(co, vec2(12.9898, 78.233))) * 212.2123;
}
void main(){
    float col = rand(xy);
    if(col < 0.01){
        col = 1.0;
    }else{
        col = 0.0;
    }
    color = vec4(vec3(col), 1);
}
`;

const uistandartVertexShader = `#version 300 es
in vec3 positions;
in vec3 normals;
in vec2 uv;
in vec3 ntangent;
uniform mat4 proj;
uniform mat4 trans;
uniform mat4 rotx;
uniform mat4 roty;
uniform mat4 mtrans;
uniform mat4 mrotx;
uniform mat4 mroty;
uniform mat4 mrotz;
uniform mat4 mscale;
uniform mat4 sproj;
uniform mat4 strans;
uniform mat4 srotx;
uniform mat4 sroty;
uniform vec2 resolution;
out vec2 xy;
out vec3 norm;
out float dep;
out vec3 posit;
out vec4 str;
out mat3 tbn;
void main(){
    gl_Position = vec4(positions.x/resolution.x, positions.y/resolution.y, positions.z, 1.0);
    xy = uv;
}
`;

const uistandartFragmentShader = `#version 300 es
precision mediump float;
layout (location = 0) out vec4 color;
in vec2 xy;
in vec3 norm;
in float dep;
uniform sampler2D albedo;
uniform sampler2D specular;
uniform sampler2D normal;
uniform sampler2D shadow;
uniform vec3 lightp[5];
uniform vec3 lightc[5];
uniform int lightt[5];
uniform vec3 ppos;
in vec3 posit;
in mat3 tbn;
uniform samplerCube cubemap;
const float constant = 1.0;
const float linear = 0.09;
const float quadratic = 0.032;
in vec4 str;
void main(){
    color = vec4(texture(albedo, xy).rgb, 1);
}
`;

const postproces = `#version 300 es
precision mediump float;
in vec2 uv;
out vec4 color;
uniform sampler2D maintex;
uniform sampler2D maindepth;
uniform sampler2D shadow;
void main(){
    color = vec4(mix(texture(maintex, uv).rgb, vec3(0.6, 0.1, 0.1), 1.0 - min((1.0-texture(maindepth, uv).r)*32.0, 1.0)), 1);
    //color = vec4(vec3(1.0 - min((1.0-texture(maindepth, uv).r)*16.0, 1.0)), 1);
}
`;

const axevshader = `#version 300 es

in vec3 positions;
in vec3 normals;
in vec2 uv;
in vec3 ntangent;

uniform mat4 proj;
uniform mat4 trans;
uniform mat4 rotx;
uniform mat4 roty;

uniform mat4 mtrans;
uniform mat4 mrotx;
uniform mat4 mroty;
uniform mat4 mrotz;
uniform mat4 mscale;

uniform mat4 sproj;
uniform mat4 strans;
uniform mat4 srotx;
uniform mat4 sroty;

out vec2 xy;
out vec3 norm;
out float dep;
out vec3 posit;
out vec4 str;
out mat3 tbn;
void main(){
    vec4 fin = mscale * vec4(positions, 1.0);
    fin = mtrans * mroty * mrotx * mrotz * fin;
    fin = proj * fin;
    fin.z /= 100.0;
    gl_Position = fin;
    fin = mscale * vec4(positions, 1.0);
    fin = mtrans * mroty * mrotx * mrotz * fin;
    fin = sproj * sroty * srotx * strans * fin;
    str = fin;
    dep = fin.z;
    xy = vec2(uv.x, uv.y+1.0);
    norm = normals;
    posit = positions;
    mat3 vTBN = transpose(mat3(
        normalize(ntangent),
        normalize(cross(normals, ntangent)),
        normalize(normals)
    ));
    tbn = vTBN;
}
`;

const axefshader = `#version 300 es
precision mediump float;
layout (location = 0) out vec4 color;
in vec2 xy;
in vec3 norm;
in float dep;
uniform sampler2D albedo;
uniform sampler2D specular;
uniform sampler2D normal;
uniform sampler2D shadow;
uniform vec3 lightp[5];
uniform vec3 lightc[5];
uniform int lightt[5];
uniform vec3 ppos;
in vec3 posit;
in mat3 tbn;
const float constant = 1.0;
const float linear = 0.09;
const float quadratic = 0.032;
in vec4 str;
float shadowMapping(){
    vec3 projected = str.xyz / str.w;
    float fshadow = 0.0f;
    if(projected.z <= 1.0f){ 
     projected = (projected + 1.0f)/2.0f; 
     float closestDepth = texture(shadow, projected.xy).r; 
     float currentDepth = projected.z; 
     if(currentDepth > closestDepth){ 
      fshadow+=1.0f;
     } 
    } 
    return fshadow; 
  } 
void main(){
    vec3 finalcolor = vec3(0);
    vec3 normal = normalize(norm);
    for(int i = 0; i!=5; i++){
        float ambientStrength = 0.4;
        vec3 ambient = ambientStrength * lightc[i];
        vec3 lightDir;
        if(lightt[i] == 0){
            lightDir =  normalize(lightp[i] - posit);
        }else{
            lightDir = normalize(lightp[i]);
        }
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * lightc[i];
        float specularStrength = texture(specular, xy).r;
        vec3 viewDir = normalize(vec3(-ppos.x, -ppos.y, -ppos.z) - posit);
        vec3 reflectDir = reflect(-lightDir, normal);  
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        vec3 specu = specularStrength * spec * lightc[i];  
        if(lightt[i] == 0){
            float distance = length(lightp[i] - posit);
            float attenuation = 1.0 / (constant + linear * distance + quadratic * (distance * distance)); 
            ambient  *= attenuation; 
            diffuse  *= attenuation;
            specu *= attenuation;     
        }
        finalcolor += (diffuse + specu + ambient) * texture(albedo, xy).gbr;
    }
    color = vec4(finalcolor, 1);
}
`;