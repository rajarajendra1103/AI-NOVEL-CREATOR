
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Character, Relationship } from '../types';

interface RelationshipGraphProps {
  characters: Character[];
  relationships: Relationship[];
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  relationship: string;
}

const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ characters, relationships }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || characters.length === 0) return;

    const nodes: Node[] = characters.map(c => ({ id: c.name, name: c.name }));
    const links: Link[] = relationships.map(r => ({
      source: r.character1,
      target: r.character2,
      relationship: r.relationship,
    }));

    const { width, height } = containerRef.current.getBoundingClientRect();
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    svg.selectAll('*').remove(); // Clear previous render

    // Significantly increased forces for better spread
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(250)) 
      .force('charge', d3.forceManyBody().strength(-1500)) 
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide(80))
      .force('x', d3.forceX().strength(0.05)) // Gentle centering
      .force('y', d3.forceY().strength(0.05));

    // Arrowhead marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 38)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94A3B8');

    const link = svg.append('g')
      .attr('stroke', '#94A3B8')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2);

    // Link labels with background rect for better readability
    const linkLabelGroup = svg.append('g')
      .selectAll('g')
      .data(links)
      .join('g');

    linkLabelGroup.append('rect')
        .attr('fill', 'rgba(255, 255, 255, 0.85)')
        .attr('rx', 4);

    const linkText = linkLabelGroup.append('text')
      .text(d => d.relationship)
      .attr('fill', '#475569')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'grab')
      .call(drag(simulation) as any);

    node.append('circle')
      .attr('r', 30)
      .attr('fill', '#7C3AED')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 3)
      .attr('class', 'drop-shadow-md'); 
    
    node.append('text')
      .text(d => d.name)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#FFFFFF')
      .style('font-weight', 'bold')
      .style('font-size', '10px')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      // Update label positions
      linkLabelGroup.attr('transform', d => {
          const x = ((d.source as Node).x! + (d.target as Node).x!) / 2;
          const y = ((d.source as Node).y! + (d.target as Node).y!) / 2;
          return `translate(${x}, ${y})`;
      });

      // Update bounding box for background rects based on text size
      linkLabelGroup.each(function() {
          const g = d3.select(this);
          const text = g.select('text');
          try {
              const bbox = (text.node() as SVGTextElement).getBBox();
              g.select('rect')
                  .attr('x', bbox.x - 4)
                  .attr('y', bbox.y - 2)
                  .attr('width', bbox.width + 8)
                  .attr('height', bbox.height + 4);
          } catch (e) {
              // Ignore bbox errors during initial render
          }
      });
      
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    const handleResize = () => {
        if (containerRef.current && svgRef.current) {
            const { width: newWidth, height: newHeight } = containerRef.current.getBoundingClientRect();
            d3.select(svgRef.current)
                .attr('width', newWidth)
                .attr('height', newHeight)
                .attr('viewBox', [-newWidth / 2, -newHeight / 2, newWidth, newHeight]);
            
            simulation.force('center', d3.forceCenter(0, 0));
            simulation.alpha(0.3).restart();
        }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
        simulation.stop();
        window.removeEventListener('resize', handleResize);
    }

  }, [characters, relationships]);

  const drag = (simulation: d3.Simulation<Node, undefined>) => {
    function dragstarted(event: d3.D3DragEvent<Element, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(event.sourceEvent.target).style("cursor", "grabbing");
    }
    
    function dragged(event: d3.D3DragEvent<Element, Node, Node>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: d3.D3DragEvent<Element, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      d3.select(event.sourceEvent.target).style("cursor", "grab");
    }
    
    return d3.drag<any, Node>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 rounded-lg overflow-hidden">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RelationshipGraph;
