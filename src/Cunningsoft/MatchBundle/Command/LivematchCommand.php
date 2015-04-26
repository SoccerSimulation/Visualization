<?php

namespace Cunningsoft\MatchBundle\Command;

use React\EventLoop\Factory;
use React\EventLoop\LibEventLoop;
use React\EventLoop\Timer\Timer;
use SoccerSimulation\Simulation\Prm;
use SoccerSimulation\Simulation\SoccerPitch;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class LivematchCommand extends ContainerAwareCommand
{
    /**
     * @var SoccerPitch
     */
    private $pitch;

    /**
     * @var \ZMQSocket
     */
    private $sender;

    /**
     * @var \ZMQSocket
     */
    private $receiver;

    /**
     * @var Timer
     */
    private $timer;

    /**
     * @var LibEventLoop
     */
    private $loop;

    protected function configure()
    {
        $this
            ->setName('soccersim:livematch')
            ->setDescription('Start the livematch evaluation.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $context = new \ZMQContext();

        $this->receiver = new \ZMQSocket($context, \ZMQ::SOCKET_PULL);
        $this->receiver->connect('tcp://localhost:5557');

        $this->sender = $context->getSocket(\ZMQ::SOCKET_PUSH);
        $this->sender->connect('tcp://localhost:5558');

        $this->pitch = new SoccerPitch();

        $this->loop = Factory::create();
        $this->timer = $this->loop->addPeriodicTimer(1 / Prm::FrameRate, array($this, 'update'));
        $this->loop->run();
    }

    public function update()
    {
        $fps = $this->receiver->recv(\ZMQ::MODE_NOBLOCK);
        if ($fps !== false) {
            $interval = 1 / $fps;
            $this->timer->cancel();
            echo 'fps: ' . $fps . "\n";
            $this->timer = $this->loop->addPeriodicTimer($interval, array($this, 'update'));
        }
        $this->pitch->update();
        $this->handleEvents();
        $render = $this->pitch;
        $this->sender->send(json_encode($render));
    }

    private function handleEvents()
    {
        $events = $this->pitch->releaseEvents();
        foreach ($events as $event) {
            $this->getContainer()->get('event_dispatcher')->dispatch($event->getName(), $event);
        }
    }
}
