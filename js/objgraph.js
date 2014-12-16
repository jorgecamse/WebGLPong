function ObjGraph(width, height, x, y, vbuff, ibuff, txtbuff, txtid, nbuff){
    this.width = width;
    this.height = height;
    this.posX = x;
    this.posY = y;
    this.vbuff = vbuff;
    this.ibuff = ibuff;
    this.txtbuff = txtbuff;
    this.txtid = txtid;
    this.nbuff = nbuff;
}

ObjGraph.prototype.draw = function() {
    pushMatrix();

    mat4.translate(mvMatrix, [this.posX, this.posY, 0.0]);
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
  
    // set the buffer to be drawn and connect up the shader parameters: 
    // vertex position, texture coordinates and vertex normal
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    gl.vertexAttribPointer(glProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, this.txtbuff);
    gl.vertexAttribPointer(glProgram.vertexTextureAttribute, 2, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
    gl.vertexAttribPointer(glProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(glProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix3fv(glProgram.normalMatrixUniform, false, normalMatrix);

    gl.activeTexture(gl.TEXTURE0 + this.txtid);
    gl.bindTexture(gl.TEXTURE_2D, textures[this.txtid]);
    gl.uniform1i(glProgram.samplerUniform, this.txtid);
  
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuff);
    gl.drawElements(gl.TRIANGLES, this.ibuff.number_vertex_points, gl.UNSIGNED_SHORT, 0);
    
    popMatrix();
}

function Ball(width, height, x, y, speed, vbuff, ibuff, txtbuff, txtid, nbuff) {
    ObjGraph.call(this, width, height, x, y, vbuff, ibuff, txtbuff, txtid, nbuff);
    this.DirX = 1;
    this.DirY = 1;
    this.speed = speed;
}
Ball.prototype = new ObjGraph();

Ball.prototype.move = function() {
    var limitX = Settings.field.width / 2.0 - 0.8*this.width;
    var limitY = Settings.field.height / 2.0 - 0.8*this.width;

    if (this.posX >= limitX || this.posX <= -limitX) {
        this.DirX = -this.DirX;
    }
    if (this.posY >= limitY || this.posY <= -limitY) {
        this.DirY = -this.DirY;
    }

    // update ball position
    this.posX += this.DirX * this.speed;
    this.posY += this.DirY * this.speed;
}

function Paddle(width, height, x, y, speed, vbuff, ibuff, txtbuff, txtid, nbuff) {
    ObjGraph.call(this, width, height, x, y, vbuff, ibuff, txtbuff, txtid, nbuff);
    this.speed = speed;
}
Paddle.prototype = new ObjGraph();

Paddle.prototype.move = function() {
    var limitX = Settings.field.width / 2.0 - this.width;

    // move right
    if (Key.isDown(Key.RIGHT) || (Key.isDown(Key.D))) {
        if (this.posX <= limitX) {
            // update paddle position
            this.posX += this.speed;
        }

    }
    // move left
    else if (Key.isDown(Key.LEFT) || (Key.isDown(Key.A))) {
        if (this.posX >= -limitX) {
            // update paddle position
            this.posX -= this.speed;
        }
    }

}