<script id="shader-vs" type="x-shader/x-vertex">
	attribute highp vec3 aVertexNormal;
    attribute highp vec3 aVertexPosition;
    attribute highp vec2 aVertexTexture;
    
    uniform highp mat3 uNormalMatrix;
    uniform highp mat4 uMVMatrix;
    uniform highp mat4 uPMatrix;
      
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;
    
    void main(void) {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        vTextureCoord = aVertexTexture;
        
        // Apply lighting effect
        
        highp vec3 ambientLight = vec3(1.0, 1.0, 1.0);
        highp vec3 directionalLightColor = vec3(0.5, 0.5, 0.75);
        highp vec3 directionalVector = vec3(0.85, 0.8, 0.75);
        
        highp vec3 transformedNormal = uNormalMatrix * aVertexNormal;
        
        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = ambientLight + (directionalLightColor * directional);
    }    
</script>