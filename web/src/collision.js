import {Vector3,Raycaster} from 'three';
/** Ground-following body: shoulder/head probes, step limit and ledge guard. */
export class Walker {
 constructor(meshes,{height=3.2,radius=.75,step=1.65}={}){this.meshes=meshes;this.height=height;this.radius=radius;this.step=step;this.ray=new Raycaster();this.ray.firstHitOnly=true;this.feet=new Vector3();this.blocked='';}
 hit(origin,direction,distance){this.ray.set(origin,direction);this.ray.near=.015;this.ray.far=distance;return this.ray.intersectObjects(this.meshes,false)[0];}
 ground(x,z,y){const h=this.hit(new Vector3(x,y+this.step+.1,z),new Vector3(0,-1,0),this.step+4);return h?h.point.y:null;}
 place(p){this.feet.copy(p);const h=this.ground(p.x,p.z,p.y);if(h!==null)this.feet.y=h;return this.feet;}
 move(delta){this.blocked='';const count=Math.max(1,Math.ceil(delta.length()/.45));const d=delta.clone().multiplyScalar(1/count);for(let i=0;i<count;i++){if(!this.attempt(d)){this.attempt(new Vector3(d.x,0,0));this.attempt(new Vector3(0,0,d.z));}}return this.feet;}
 attempt(d){const len=d.length();if(len<1e-7)return true;const dir=d.clone().normalize();const side=new Vector3(-dir.z,0,dir.x);
  for(const height of [this.step+.15,this.height-.25])for(const offset of [-this.radius*.8,0,this.radius*.8]){const p=this.feet.clone().addScaledVector(side,offset);p.y+=height;if(this.hit(p,dir,len+this.radius)){this.blocked='obstacle';return false;}}
  const x=this.feet.x+d.x,z=this.feet.z+d.z,h=this.ground(x,z,this.feet.y);if(h===null||h<this.feet.y-2.2||h>this.feet.y+this.step){this.blocked='ledge';return false;}
  // Probe ahead of the body too, so its center never projects over a cliff.
  const edge=this.ground(x+dir.x*this.radius,z+dir.z*this.radius,h);if(edge===null||edge<h-2.2){this.blocked='ledge';return false;}
  this.feet.set(x,h,z);return true;
 }
}
